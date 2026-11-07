// MahaDiagno AI — live voice agent session (app ⇄ this backend ⇄ Deepgram Voice Agent API).
// Deepgram does STT (nova-3) → LLM (OpenAI) → TTS (Cartesia) with turn-taking / barge-in.
// This module authenticates nothing itself (see websocket/aiVoiceAgent.js); it receives an
// already-authenticated app socket + userId, sends the Settings message, relays audio both
// ways, executes client-side function calls with runTool and forwards cards / transcripts.
// Docs: https://developers.deepgram.com/docs/configure-voice-agent (+ llm/tts model pages).
import WebSocket from 'ws'
import prisma from '../../Utils/prismaclint.js'
import { toolDefinitions, runTool } from './tools.js'
import { nowIST, addDays, weekdayOf } from './time.js'

const DEFAULT_AGENT_URL = 'wss://agent.deepgram.com/v1/agent/converse'
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const CARTESIA_TTS_URL = 'https://api.cartesia.ai/tts/bytes'

const START_TIMEOUT_MS = 15_000          // app must send {type:'start'} within this
const KEEPALIVE_IDLE_MS = 5_000          // send KeepAlive when no audio for this long
const MAX_CALL_MS = 15 * 60 * 1000       // hard cap on a call
const END_NOTICE_GRACE_MS = 9_000        // time to speak the "call ending" notice
const APP_PING_MS = 30_000               // detect dead mobile connections

const send = (ws, obj) => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
}

const cleanLocation = (raw) => {
    if (!raw || typeof raw !== 'object') return undefined
    const latitude = Number(raw.latitude)
    const longitude = Number(raw.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
    return { latitude, longitude }
}

// 'byo' (default): Deepgram calls OpenAI with OUR key/endpoint (any OPENAI_MODEL works).
// 'managed': Deepgram's managed OpenAI LLM (billed by Deepgram, only its listed models).
const thinkMode = () => (String(process.env.DEEPGRAM_THINK_MODE || 'byo').toLowerCase() === 'managed' ? 'managed' : 'byo')

const voiceIdFor = (language) => (language === 'hi'
    ? (process.env.CARTESIA_VOICE_ID_HI || process.env.CARTESIA_VOICE_ID)
    : process.env.CARTESIA_VOICE_ID)

export const missingVoiceAgentConfig = (language = 'en') => {
    const missing = []
    if (!process.env.DEEPGRAM_API_KEY) missing.push('DEEPGRAM_API_KEY')
    if (thinkMode() === 'byo' && !process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY')
    if (!process.env.CARTESIA_API_KEY) missing.push('CARTESIA_API_KEY')
    if (!voiceIdFor(language)) missing.push(language === 'hi' ? 'CARTESIA_VOICE_ID (or CARTESIA_VOICE_ID_HI)' : 'CARTESIA_VOICE_ID')
    return missing
}

// ---------- prompt / settings ----------

const buildVoicePrompt = (firstName, language) => {
    const now = nowIST()
    const week = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(now.date, i)
        return `${d} ${weekdayOf(d)}`
    }).join(', ')
    return [
        'You are "MahaDiagno AI", the voice assistant of the MahaDiagno healthcare app, talking to the user on a live voice call.',
        'You help ONLY with things inside MahaDiagno: finding doctors and booking video consultations, the user\'s doctor appointments, lab tests (diagnostic bookings) and medicine orders. Politely decline anything else.',
        `Today is ${now.weekday}, ${now.date}, and the time is ${now.time} (Asia/Kolkata). Next 7 days: ${week}. Always pass dates to tools as YYYY-MM-DD.`,
        firstName ? `The user's first name is ${firstName}.` : '',
        '',
        'Safety:',
        '- You are not a doctor. You may suggest which kind of specialist to see, but never diagnose, never name a disease as certain, never suggest medicines or doses.',
        '- EMERGENCY FIRST: if the user mentions chest pain with sweating, difficulty breathing, signs of stroke (face drooping, arm weakness, slurred speech), heavy bleeding, unconsciousness, or suicidal thoughts / self-harm, your very first sentence must tell them to call 112 or go to the nearest emergency room immediately. Only after that may you offer help in the app.',
        '',
        'Data rules:',
        '- Never invent doctors, slots, fees, prices, statuses, refunds or dates. Use only what the tools return. If a tool returns nothing, say so.',
        '- To map symptoms to a specialist, call list_specializations, pick the closest one, then call search_doctors with that specialization and the symptoms.',
        '- Tool results marked shownToUserAsCards are already on the user\'s screen: give a one-sentence summary and say "I\'ve put the details on your screen" instead of reading the items out.',
        '- Booking: find doctor, then get_doctor_slots, then when the user picks a slot call prepare_doctor_booking with that slotId and date. Then say the booking is ready on the screen and is confirmed only after they tap "Confirm & Pay" and complete the payment. You can never book or take payment yourself.',
        '- Cancelling: always call request_cancel_appointment, mention the refund estimate, and tell the user to tap "Yes, cancel" on the screen to confirm. You can never cancel yourself. Only SCHEDULED appointments can be cancelled.',
        '- Rescheduling is not available. Offer to cancel and book a new slot instead.',
        '- If "my appointment" is ambiguous, fetch the appointments first. If you need a detail (date, which doctor), ask one short question.',
        '',
        'Speaking style (your words are converted to speech):',
        '- Very short answers: one or two short sentences, at most about 30 words, then stop and let the user talk.',
        '- Plain spoken text only: no markdown, lists, bullet points, emojis, URLs, IDs or symbols. Never read out slot IDs, appointment IDs or raw dates; say "Monday the 9th" or "tomorrow".',
        '- Read times naturally, for example "10:30 AM" as "ten thirty in the morning", and money as "500 rupees".',
        '- When offering choices, mention at most two or three options by name.',
        language === 'hi'
            ? '- The user chose Hindi. Reply in simple, natural spoken Hindi written in Devanagari script (common English words like doctor, appointment, slot are fine). If the user clearly speaks English, reply in English.'
            : '- Reply in the user\'s language: English by default; if the user speaks Hindi or Hinglish, reply in simple spoken Hindi written in Devanagari script.',
    ].filter(l => l !== null).join('\n')
}

const greetingFor = (firstName, language) => (language === 'hi'
    ? `नमस्ते${firstName ? ` ${firstName}` : ''}, मैं MahaDiagno AI हूँ। बताइए, मैं आपकी क्या मदद करूँ?`
    : `Hi${firstName ? ` ${firstName}` : ''}, I'm MahaDiagno AI. How can I help you today?`)

// functions whose cards should only appear once the user's turn is confirmed (no speculative drafts)
const DEFER_UNTIL_EOT = new Set(['prepare_doctor_booking', 'request_cancel_appointment'])

// OpenAI tool definitions → Deepgram think.functions (client-side: no endpoint)
export const deepgramFunctions = () => toolDefinitions.map(({ function: f }) => ({
    name: f.name,
    description: f.description,
    parameters: f.parameters,
    ...(DEFER_UNTIL_EOT.has(f.name) ? { defer_until_eot: true } : {}),
}))

export const buildSettings = ({ firstName, language }) => {
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    // reasoning models (gpt-5 family, o-series) don't take temperature
    const supportsTemperature = !/^(gpt-5|o\d)/i.test(model) || /chat-latest$/i.test(model)
    const think = {
        provider: { type: 'open_ai', model, ...(supportsTemperature ? { temperature: 0.3 } : {}) },
        prompt: buildVoicePrompt(firstName, language),
        functions: deepgramFunctions(),
    }
    if (thinkMode() === 'byo') {
        think.endpoint = {
            url: process.env.OPENAI_CHAT_URL || OPENAI_CHAT_URL,
            headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
    }

    const speakProvider = {
        type: 'cartesia',
        model_id: process.env.CARTESIA_MODEL || 'sonic-3',
        voice: { mode: 'id', id: voiceIdFor(language) },
        language: language === 'hi' ? 'hi' : 'en',
    }
    // optional Cartesia-Version passthrough (Deepgram's schema has provider.version); off unless set
    if (process.env.CARTESIA_AGENT_VERSION) speakProvider.version = process.env.CARTESIA_AGENT_VERSION

    return {
        type: 'Settings',
        tags: ['mahadiagno', 'voice_agent'],
        audio: {
            input: { encoding: 'linear16', sample_rate: 16000 },
            output: { encoding: 'linear16', sample_rate: 24000, container: 'none' },
        },
        agent: {
            listen: {
                provider: {
                    type: 'deepgram',
                    model: 'nova-3',
                    // nova-3 "multi" = code-switching (Hindi + English / Hinglish)
                    language: language === 'hi' ? 'multi' : 'en',
                    smart_format: true,
                },
            },
            think,
            speak: {
                provider: speakProvider,
                endpoint: {
                    url: process.env.CARTESIA_TTS_URL || CARTESIA_TTS_URL,
                    headers: { 'x-api-key': process.env.CARTESIA_API_KEY },
                },
            },
            greeting: greetingFor(firstName, language),
        },
    }
}

// for logs: never print secrets
export const redactSettings = (settings) => JSON.parse(JSON.stringify(settings, (k, v) => {
    if (['authorization', 'x-api-key'].includes(String(k).toLowerCase()) && typeof v === 'string') return '<redacted>'
    return v
}))

// ---------- session ----------

/**
 * Runs one voice call. `appWs` is an authenticated `ws` socket from the app.
 * @param {import('ws').WebSocket} appWs
 * @param {{ userId: number }} p
 */
export const runVoiceAgentSession = (appWs, { userId }) => {
    const tag = `[voice-agent u${userId}]`
    let dg = null
    let started = false
    let ready = false
    let closed = false
    let lastAudioToDg = Date.now()
    let ctx = { userId, location: undefined }
    let settings = null
    const cancelled = new Set()
    const timers = []

    console.log(`${tag} app connected`)

    const cleanup = () => {
        timers.forEach(t => clearInterval(t))
        timers.length = 0
    }

    // ends the call: optional error event to the app, then close both sides
    const end = (reason, error) => {
        if (closed) return
        closed = true
        cleanup()
        console.log(`${tag} ending: ${reason}`)
        if (error) send(appWs, { type: 'error', ...error })
        if (appWs.readyState === WebSocket.OPEN || appWs.readyState === WebSocket.CONNECTING) {
            appWs.close(1000, String(reason).slice(0, 120))
        }
        if (dg && (dg.readyState === WebSocket.OPEN || dg.readyState === WebSocket.CONNECTING)) {
            try { dg.close(1000) } catch { dg.terminate() }
        }
    }

    const startTimer = setTimeout(() => {
        if (!started) end('start_timeout', { code: 'upstream_error', message: 'No start message received.' })
    }, START_TIMEOUT_MS)
    timers.push(startTimer)

    // app heartbeat
    let appAlive = true
    appWs.on('pong', () => { appAlive = true })
    timers.push(setInterval(() => {
        if (!appAlive) { console.log(`${tag} app heartbeat lost`); appWs.terminate(); return }
        appAlive = false
        try { appWs.ping() } catch { /* closed */ }
    }, APP_PING_MS))

    const handleFunctionCalls = async (functions) => {
        send(appWs, { type: 'thinking' })
        const cards = new Map()
        await Promise.all((functions || []).map(async (f) => {
            if (f?.client_side === false) return // Deepgram handles server-side functions itself
            console.log(`${tag} function ${f.name} ${f.arguments || '{}'}`)
            const { result, card } = await runTool(f.name, f.arguments, ctx)
            if (closed || cancelled.has(f.id)) {
                console.log(`${tag} function ${f.name} (${f.id}) cancelled, response dropped`)
                return
            }
            if (card?.type) { cards.delete(card.type); cards.set(card.type, card) }
            if (dg?.readyState === WebSocket.OPEN) {
                dg.send(JSON.stringify({
                    type: 'FunctionCallResponse',
                    id: f.id,
                    name: f.name,
                    content: JSON.stringify(result ?? {}),
                }))
            }
        }))
        if (cards.size && !closed) send(appWs, { type: 'cards', cards: [...cards.values()] })
    }

    const onDeepgramText = (raw) => {
        let msg
        try { msg = JSON.parse(raw) } catch { console.log(`${tag} bad JSON from Deepgram`); return }
        switch (msg.type) {
            case 'Welcome': {
                // docs: send Settings only after Welcome
                if (settings) dg.send(JSON.stringify(settings))
                break
            }
            case 'SettingsApplied':
                ready = true
                lastAudioToDg = Date.now()
                console.log(`${tag} settings applied`)
                send(appWs, { type: 'ready' })
                break
            case 'UserStartedSpeaking':
                send(appWs, { type: 'user_speaking' })
                break
            case 'AgentThinking':
                send(appWs, { type: 'thinking' })
                break
            case 'AgentStartedSpeaking':
                send(appWs, { type: 'speaking' })
                break
            case 'AgentAudioDone':
                send(appWs, { type: 'agent_done' })
                break
            case 'ConversationText': {
                const text = String(msg.content ?? '').trim()
                if (text && (msg.role === 'user' || msg.role === 'assistant')) {
                    send(appWs, { type: 'transcript', role: msg.role, text })
                }
                break
            }
            case 'FunctionCallRequest':
                handleFunctionCalls(msg.functions).catch(e => console.log(`${tag} function handling failed`, e))
                break
            case 'FunctionCallCancelled':
                for (const f of msg.functions || []) cancelled.add(f.id)
                break
            case 'Warning':
                console.log(`${tag} Deepgram warning ${msg.code}: ${msg.description}`)
                break
            case 'Error':
                console.log(`${tag} Deepgram error ${msg.code}: ${msg.description}`)
                end(`deepgram_error ${msg.code}`, { code: 'upstream_error', message: 'The voice assistant ran into a problem. Please try again.' })
                break
            default:
                // History, FunctionCallResponse (server-side), PromptUpdated, InjectionRefused, LatencyReport, ...
                break
        }
    }

    const connectDeepgram = async (language) => {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { first_name: true } }).catch(() => null)
        if (closed) return
        const firstName = user?.first_name?.trim() || null
        settings = buildSettings({ firstName, language })
        console.log(`${tag} Settings`, JSON.stringify(redactSettings({ ...settings, agent: { ...settings.agent, think: { ...settings.agent.think, prompt: `<${settings.agent.think.prompt.length} chars>`, functions: settings.agent.think.functions.map(f => f.name) } } })))

        const url = process.env.DEEPGRAM_AGENT_URL || DEFAULT_AGENT_URL
        dg = new WebSocket(url, { headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` } })

        dg.on('open', () => console.log(`${tag} Deepgram connected`))
        dg.on('message', (data, isBinary) => {
            if (closed) return
            if (isBinary) {
                if (appWs.readyState === WebSocket.OPEN) appWs.send(data, { binary: true })
            } else {
                onDeepgramText(data.toString())
            }
        })
        dg.on('unexpected-response', (req, res) => {
            console.log(`${tag} Deepgram handshake failed: HTTP ${res.statusCode}`)
            end('deepgram_handshake_failed', { code: res.statusCode === 401 || res.statusCode === 403 ? 'ai_unavailable' : 'upstream_error', message: 'Could not connect to the voice service. Please try again later.' })
        })
        dg.on('error', (e) => {
            console.log(`${tag} Deepgram socket error:`, e.message)
            end('deepgram_socket_error', { code: 'upstream_error', message: 'Lost connection to the voice service.' })
        })
        dg.on('close', (code, reason) => {
            console.log(`${tag} Deepgram closed ${code} ${reason}`)
            end('deepgram_closed', { code: 'upstream_error', message: 'The voice service ended the call.' })
        })

        // KeepAlive while no audio is flowing (e.g. muted)
        timers.push(setInterval(() => {
            if (ready && dg?.readyState === WebSocket.OPEN && Date.now() - lastAudioToDg >= KEEPALIVE_IDLE_MS) {
                dg.send(JSON.stringify({ type: 'KeepAlive' }))
                lastAudioToDg = Date.now()
            }
        }, 1000))

        // max call length
        const maxTimer = setTimeout(() => {
            if (closed) return
            const notice = language === 'hi'
                ? 'कॉल का समय पूरा हो गया है। ज़रूरत हो तो आप फिर से कॉल कर सकते हैं। धन्यवाद!'
                : 'We have reached the maximum call time. Please call again if you need anything more. Goodbye!'
            console.log(`${tag} max call length reached`)
            if (dg?.readyState === WebSocket.OPEN) dg.send(JSON.stringify({ type: 'InjectAgentMessage', behavior: 'interrupt', message: notice }))
            send(appWs, { type: 'transcript', role: 'assistant', text: notice })
            const t = setTimeout(() => end('max_call_length'), END_NOTICE_GRACE_MS)
            timers.push(t)
        }, MAX_CALL_MS)
        timers.push(maxTimer)
    }

    appWs.on('message', (data, isBinary) => {
        if (closed) return
        if (isBinary) {
            // mic audio: PCM16 LE 16 kHz mono; only after Deepgram applied the settings
            if (ready && dg?.readyState === WebSocket.OPEN) {
                dg.send(data, { binary: true })
                lastAudioToDg = Date.now()
            }
            return
        }
        let msg
        try { msg = JSON.parse(data.toString()) } catch { return }
        if (msg?.type === 'start' && !started) {
            started = true
            clearTimeout(startTimer)
            const language = msg.language === 'hi' ? 'hi' : 'en'
            ctx = { userId, location: cleanLocation(msg.location) }
            const missing = missingVoiceAgentConfig(language)
            if (missing.length) {
                console.log(`${tag} not configured, missing: ${missing.join(', ')}`)
                end('ai_unavailable', { code: 'ai_unavailable', message: `The voice assistant is not configured yet (missing ${missing.join(', ')}).` })
                return
            }
            connectDeepgram(language).catch((e) => {
                console.log(`${tag} failed to start`, e)
                end('start_failed', { code: 'upstream_error', message: 'Could not start the voice assistant.' })
            })
        } else if (msg?.type === 'stop') {
            end('stopped_by_user')
        }
    })

    appWs.on('close', (code) => {
        console.log(`${tag} app closed ${code}`)
        end('app_closed')
    })
    appWs.on('error', (e) => {
        console.log(`${tag} app socket error:`, e.message)
        end('app_error')
    })
}
