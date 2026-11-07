// MahaDiagno AI — OpenAI Chat Completions tool loop.
import OpenAI from 'openai'
import prisma from '../../Utils/prismaclint.js'
import { toolDefinitions, runTool } from './tools.js'
import { nowIST, addDays, weekdayOf } from './time.js'

const MAX_ROUNDS = 6

export class AiUnavailableError extends Error { }

let client = null
const getClient = () => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return null
    if (!client || client.apiKey !== apiKey) client = new OpenAI({ apiKey })
    return client
}

export const isAiConfigured = () => Boolean(process.env.OPENAI_API_KEY)

const buildSystemPrompt = (firstName) => {
    const now = nowIST()
    const week = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(now.date, i)
        return `${d} ${weekdayOf(d)}`
    }).join(', ')
    return [
        'You are "MahaDiagno AI", the in-app healthcare assistant of the MahaDiagno app.',
        'You help ONLY with things inside MahaDiagno: finding doctors and booking video consultations, the user\'s doctor appointments, lab tests (diagnostic bookings) and medicine orders. Politely decline unrelated requests.',
        `Today is ${now.weekday}, ${now.date}, and the time is ${now.time} (Asia/Kolkata). Next 7 days: ${week}. Always pass dates to tools as YYYY-MM-DD.`,
        firstName ? `The user's first name is ${firstName}.` : '',
        '',
        'Safety:',
        '- You are not a doctor. You may suggest which kind of specialist to see based on symptoms, but never diagnose, never name a disease as certain, never prescribe or suggest medicines or doses.',
        '- EMERGENCY FIRST: if the user mentions chest pain with sweating, difficulty breathing, signs of stroke (face drooping, arm weakness, slurred speech), heavy bleeding, unconsciousness, or suicidal thoughts / self-harm, your first sentence must tell them to call 112 or go to the nearest emergency room immediately. Only after that may you offer help in the app.',
        '',
        'Data rules:',
        '- Never invent doctors, slots, fees, prices, statuses, refunds or dates. Use only what the tools return. If a tool returns nothing, say so.',
        '- To map symptoms to a specialist, call list_specializations and pick the closest one, then call search_doctors with that specialization (and the symptoms).',
        '- Tool results marked shownToUserAsCards are already displayed to the user as cards: summarise in one or two sentences instead of listing every item.',
        '- Booking: find doctor -> get_doctor_slots -> when the user picks a slot (e.g. "Book the 10:30 slot on 2026-11-09 with Dr. X (slot 45)"), call prepare_doctor_booking with that slotId and date. Then say the booking is ready and that it is confirmed only after they tap "Confirm & Pay" and complete the payment. You can never book or take payment yourself.',
        '- Cancelling: always call request_cancel_appointment, mention the refund estimate, and tell the user to tap "Yes, cancel" on the card to confirm. You can never cancel yourself. Only SCHEDULED appointments can be cancelled.',
        '- Rescheduling is not available to users. Explain this and offer to cancel the appointment and book a new slot instead.',
        '- If the user refers to "my appointment" and it is ambiguous, fetch their appointments first.',
        '',
        'Style:',
        '- Reply in the user\'s language: English, Hindi (in Devanagari) or Hinglish (Hindi in Latin letters) exactly as the user writes.',
        '- Keep replies short (2-4 sentences) because they may be read aloud. Plain text only: no markdown, no tables, no bullet lists, no emojis.',
    ].filter(l => l !== null).join('\n')
}

// keeps the latest card of each type, in order of last emission
const addCard = (cards, card) => {
    if (!card?.type) return
    cards.delete(card.type)
    cards.set(card.type, card)
}

/**
 * @param {{ userId: number, messages: {role:'user'|'assistant', content:string}[], location?: {latitude:number, longitude:number} }} p
 * @returns {Promise<{ reply: string, cards: object[] }>}
 */
export const runAssistant = async ({ userId, messages, location }) => {
    const openai = getClient()
    if (!openai) throw new AiUnavailableError('OPENAI_API_KEY missing')

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { first_name: true } }).catch(() => null)
    const firstName = user?.first_name?.trim() || null

    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    const convo = [{ role: 'system', content: buildSystemPrompt(firstName) }, ...messages]
    const cards = new Map()
    const ctx = { userId, location }

    for (let round = 0; round < MAX_ROUNDS; round++) {
        let completion
        try {
            completion = await openai.chat.completions.create({
                model,
                messages: convo,
                tools: toolDefinitions,
                tool_choice: 'auto',
                parallel_tool_calls: true,
                temperature: 0.3,
                max_completion_tokens: 600,
            })
        } catch (error) {
            console.log('OpenAI request failed:', error?.status, error?.message)
            throw new AiUnavailableError(error?.message || 'OpenAI request failed')
        }

        const msg = completion.choices?.[0]?.message
        if (!msg) throw new AiUnavailableError('Empty OpenAI response')

        const toolCalls = (msg.tool_calls || []).filter(tc => tc.type === 'function')
        if (!toolCalls.length) {
            return { reply: (msg.content || '').trim() || 'Sorry, I could not answer that. Please try again.', cards: [...cards.values()] }
        }

        convo.push({ role: 'assistant', content: msg.content ?? null, tool_calls: toolCalls })
        for (const tc of toolCalls) {
            const { result, card } = await runTool(tc.function.name, tc.function.arguments, ctx)
            addCard(cards, card)
            convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result ?? {}) })
        }
    }

    // ran out of rounds: ask once more without tools for a final text answer
    try {
        const completion = await openai.chat.completions.create({
            model,
            messages: [...convo, { role: 'system', content: 'Answer the user now in 2-4 short sentences using the information above. Do not call tools.' }],
            temperature: 0.3,
            max_completion_tokens: 400,
        })
        const reply = completion.choices?.[0]?.message?.content?.trim()
        return { reply: reply || 'Here is what I found.', cards: [...cards.values()] }
    } catch (error) {
        console.log('OpenAI final request failed:', error?.status, error?.message)
        return { reply: 'Here is what I found.', cards: [...cards.values()] }
    }
}
