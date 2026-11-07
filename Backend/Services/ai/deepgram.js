// Deepgram speech-to-text (nova-3, multilingual: English + Hindi + Hinglish) via plain fetch.
const BASE = 'https://api.deepgram.com/v1'

export const isSttConfigured = () => Boolean(process.env.DEEPGRAM_API_KEY)

export const transcribe = async (buffer, mimetype) => {
    const key = process.env.DEEPGRAM_API_KEY
    if (!key) throw new Error('DEEPGRAM_API_KEY missing')
    const url = `${BASE}/listen?model=nova-3&language=multi&smart_format=true&punctuate=true`
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Token ${key}`, 'Content-Type': mimetype || 'audio/mp4' },
        body: buffer,
        signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Deepgram STT ${res.status}: ${text.slice(0, 300)}`)
    }
    const data = await res.json()
    return (data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '').trim()
}