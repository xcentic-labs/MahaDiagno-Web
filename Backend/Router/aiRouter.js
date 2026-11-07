import express from 'express'
import multer from 'multer'
import { requireUser } from '../Middleware/userAuth.js'
import { chat, voice, speakText } from '../Controller/aiController.js'

export const aiRouter = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
})

// multer errors (e.g. file too large) → 400 instead of the default 500
const audioUpload = (req, res, next) => {
    upload.single('audio')(req, res, (err) => {
        if (!err) return next()
        console.log('AI voice upload error:', err.message)
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'audio file is too large (max 10 MB)' : err.message
        return res.status(400).json({ error: msg })
    })
}

aiRouter.post('/chat', requireUser, chat)
aiRouter.post('/voice', requireUser, audioUpload, voice)
aiRouter.post('/speak', requireUser, speakText)
