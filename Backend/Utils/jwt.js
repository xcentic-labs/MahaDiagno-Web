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