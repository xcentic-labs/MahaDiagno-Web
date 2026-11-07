// Live voice agent WebSocket: ws(s)://<host>/api/v1/ai/voice-agent
// Shares the http server with socket.io. socket.io is created with destroyUpgrade:false
// (see locationSocket.js), so this module owns every non-socket.io upgrade.
import { WebSocketServer } from 'ws'
import { verifyToken } from '../Utils/jwt.js'
import { runVoiceAgentSession } from '../Services/ai/voiceAgent.js'

export const VOICE_AGENT_PATH = '/api/v1/ai/voice-agent'
const SOCKET_IO_PATH = '/socket.io'

// same rules as Middleware/userAuth.js requireUser → userId | null
const userIdFromRequest = (req, url) => {
    try {
        const header = req.headers.authorization || ''
        const token = header.startsWith('Bearer ') ? header.slice(7).trim() : (url.searchParams.get('token') || '').trim()
        if (!token) return null
        const payload = verifyToken(token)
        if (payload?.role !== 'USER' || !Number.isInteger(Number(payload.id))) return null
        return Number(payload.id)
    } catch (e) {
        console.log('voice-agent: invalid token', e.message)
        return null
    }
}

export function initVoiceAgentSocket(server) {
    const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 })

    server.on('upgrade', (req, socket, head) => {
        let url
        try { url = new URL(req.url, 'http://localhost') } catch { socket.destroy(); return }

        if (url.pathname.startsWith(SOCKET_IO_PATH)) return // engine.io handles it
        if (url.pathname !== VOICE_AGENT_PATH) { socket.destroy(); return }

        // complete the handshake first so the app gets a proper close code (4401)
        const userId = userIdFromRequest(req, url)
        wss.handleUpgrade(req, socket, head, (ws) => {
            if (!userId) {
                console.log('voice-agent: rejected (login_required)')
                ws.close(4401, 'login_required')
                return
            }
            runVoiceAgentSession(ws, { userId })
        })
    })

    return wss
}
