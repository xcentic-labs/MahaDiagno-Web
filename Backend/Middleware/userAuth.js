import { verifyToken } from "../Utils/jwt.js"

// app user auth: Authorization: Bearer <userToken> (role USER)
export const requireUser = (req, res, next) => {
    try {
        const header = req.get('Authorization') || ''
        const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
        if (!token) return res.status(401).json({ error: 'login_required' })
        const payload = verifyToken(token)
        if (payload?.role !== 'USER' || !Number.isInteger(Number(payload.id))) {
            return res.status(401).json({ error: 'login_required' })
        }
        req.userId = Number(payload.id)
        next()
    } catch (e) {
        console.log('requireUser: invalid token', e.message)
        return res.status(401).json({ error: 'login_required' })
    }
}
