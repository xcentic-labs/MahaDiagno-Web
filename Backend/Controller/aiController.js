import { runAssistant, isAiConfigured, AiUnavailableError } from '../Services/ai/assistant.js'
import { transcribe, isSttConfigured } from '../Services/ai/deepgram.js'
import { speak, isTtsConfigured } from '../Services/ai/tts.js'

const MAX_MESSAGES = 20
const MAX_CONTENT = 2000
const AUDIO_MIME = 'audio/mpeg'
const NOT_CONFIGURED = 'The AI assistant is not configured yet.'
const VOICE_NOT_CONFIGURED = 'Voice is not configured yet.'
const AI_FAILED = 'The AI assistant is unavailable right now. Please try again in a moment.'
const DIDNT_CATCH = "Sorry, I didn't catch that. Please try again."

// multipart fields arrive as strings
const parseMaybeJson = (v) => {
    if (typeof v !== 'string') return v
    if (!v.trim()) return undefined
    try { return JSON.parse(v) } catch { return Symbol.for('invalid') }
}

// returns { messages } or { error }
const cleanMessages = (raw, { allowEmpty = false } = {}) => {
    if (raw === undefined && allowEmpty) return { messages: [] }
    if (!Array.isArray(raw)) return { error: 'messages must be an array' }
    const messages = []
    for (const m of raw) {
        if (!m || typeof m !== 'object' || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string') {
            return { error: 'each message must be { role: "user" | "assistant", content: string }' }
        }
        const content = m.content.trim().slice(0, MAX_CONTENT)
        if (content) messages.push({ role: m.role, content })
    }
    const kept = messages.slice(-MAX_MESSAGES)
    // the model should not start on a dangling assistant turn
    while (kept.length && kept[0].role !== 'user') kept.shift()
    if (!allowEmpty && (!kept.length || kept[kept.length - 1].role !== 'user')) {
        return { error: 'the last message must be a non-empty user message' }
    }
    return { messages: kept }
}

const cleanLocation = (raw) => {
    if (!raw || typeof raw !== 'object') return undefined
    const latitude = Number(raw.latitude)
    const longitude = Number(raw.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
    return { latitude, longitude }
}

export const chat = async (req, res) => {
    const { messages, error } = cleanMessages(req.body?.messages)
    if (error) return res.status(400).json({ error })
    if (!isAiConfigured()) return res.status(502).json({ error: 'ai_unavailable', reply: NOT_CONFIGURED })

    try {
        const { reply, cards } = await runAssistant({ userId: req.userId, messages, location: cleanLocation(req.body?.location) })
        return res.status(200).json({ reply, cards })
    } catch (err) {
        console.log('AI chat failed:', err)
        if (err instanceof AiUnavailableError) return res.status(502).json({ error: 'ai_unavailable', reply: AI_FAILED })
        return res.status(500).json({ error: 'Internal server error', reply: AI_FAILED })
    }
}

export const voice = async (req, res) => {
    // voice needs STT (Deepgram) + the LLM; TTS (Cartesia) is optional → audio:null
    if (!isSttConfigured()) return res.status(502).json({ error: 'ai_unavailable', reply: VOICE_NOT_CONFIGURED })
    if (!isAiConfigured()) return res.status(502).json({ error: 'ai_unavailable', reply: NOT_CONFIGURED })
    if (!req.file?.buffer?.length) return res.status(400).json({ error: 'audio file is required' })

    const rawMessages = parseMaybeJson(req.body?.messages)
    const rawLocation = parseMaybeJson(req.body?.location)
    if (rawMessages === Symbol.for('invalid')) return res.status(400).json({ error: 'messages must be a JSON array string' })
    const { messages: history, error } = cleanMessages(rawMessages, { allowEmpty: true })
    if (error) return res.status(400).json({ error })
    const location = rawLocation === Symbol.for('invalid') ? undefined : cleanLocation(rawLocation)
    const wantAudio = String(req.body?.speak ?? 'true').toLowerCase() !== 'false'

    let transcript
    try {
        transcript = await transcribe(req.file.buffer, req.file.mimetype)
    } catch (err) {
        console.log('AI voice transcription failed:', err)
        return res.status(502).json({ error: 'ai_unavailable', reply: 'Voice is unavailable right now. Please type your message.' })
    }

    if (!transcript) {
        return res.status(200).json({
            transcript: '', reply: DIDNT_CATCH, cards: [],
            audio: wantAudio ? await speak(DIDNT_CATCH) : null, audioMime: AUDIO_MIME,
        })
    }

    try {
        const messages = [...history, { role: 'user', content: transcript.slice(0, MAX_CONTENT) }].slice(-MAX_MESSAGES)
        while (messages.length && messages[0].role !== 'user') messages.shift()
        const { reply, cards } = await runAssistant({ userId: req.userId, messages, location })
        const audio = wantAudio ? await speak(reply) : null
        return res.status(200).json({ transcript, reply, cards, audio, audioMime: AUDIO_MIME })
    } catch (err) {
        console.log('AI voice failed:', err)
        if (err instanceof AiUnavailableError) return res.status(502).json({ error: 'ai_unavailable', transcript, reply: AI_FAILED })
        return res.status(500).json({ error: 'Internal server error', transcript, reply: AI_FAILED })
    }
}

export const speakText = async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, MAX_CONTENT) : ''
    if (!text) return res.status(400).json({ error: 'text is required' })
    if (!isTtsConfigured()) return res.status(502).json({ error: 'tts_unavailable' })

    const audio = await speak(text)
    if (!audio) return res.status(502).json({ error: 'tts_unavailable' })
    return res.status(200).json({ audio, audioMime: AUDIO_MIME })
}
