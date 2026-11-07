// Text-to-speech via Cartesia (plain fetch). Swappable: export speak(text) → base64 mp3 | null.
// Never throws: TTS must never break a chat/voice request.
const URL = 'https://api.cartesia.ai/tts/bytes'
const DEVANAGARI = /[ऀ-ॿ]/

export const isTtsConfigured = () => Boolean(process.env.CARTESIA_API_KEY && process.env.CARTESIA_VOICE_ID)

export const speak = async (text) => {
    const transcript = String(text ?? '').trim().slice(0, 2000)
    if (!transcript) return null

    const key = process.env.CARTESIA_API_KEY
    const language = DEVANAGARI.test(transcript) ? 'hi' : 'en'
    const voiceId = language === 'hi'
        ? (process.env.CARTESIA_VOICE_ID_HI || process.env.CARTESIA_VOICE_ID)
        : process.env.CARTESIA_VOICE_ID
    if (!key || !voiceId) {
        console.log('Cartesia TTS skipped: CARTESIA_API_KEY or voice id missing')
        return null
    }

    try {
        const res = await fetch(URL, {
            method: 'POST',
            headers: {
                'X-API-Key': key,
                'Cartesia-Version': process.env.CARTESIA_VERSION || '2026-03-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model_id: process.env.CARTESIA_MODEL || 'sonic-3',
                transcript,
                voice: { mode: 'id', id: voiceId },
                language,
                output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
            }),
            signal: AbortSignal.timeout(30000),
        })
        if (!res.ok) {
            const body = await res.text().catch(() => '')
            console.log(`Cartesia TTS ${res.status}:`, body.slice(0, 300))
            return null
        }
        const buf = Buffer.from(await res.arrayBuffer())
        return buf.length ? buf.toString('base64') : null
    } catch (error) {
        console.log('Cartesia TTS failed:', error?.message)
        return null
    }
}
