import jwt from 'jsonwebtoken'
import 'dotenv/config'
const KEY = process.env.JWT_KEY

// generating the jwt token 
export const generateToken = (email, id)=>{
    return jwt.sign({
        email : email,
        id : id,
        role : 'ADMIN'
    } , KEY , {expiresIn :'7d'})
}

// verifying the jwt token

export const verifyToken = (token)=>{
    return jwt.verify(token , KEY)
}

// user (app) token — used by /api/v1/ai/*
export const generateUserToken = (user) => {
    return jwt.sign({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: 'USER'
    }, KEY, { expiresIn: '30d' })
}
