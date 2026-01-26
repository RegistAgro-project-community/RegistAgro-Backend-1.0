import { type Request, type Response, type NextFunction } from "express";
import jwt from 'jsonwebtoken'
import 'dotenv/config'

interface payload{
    userId: string,
    rule: string
}

export function auth(req: Request, res: Response, next: NextFunction){
    const authToken = req.headers.authorization

    if(!authToken){
        return res.status(403).json({error: "Acesso negado"})
    }

    const token = authToken.split(" ")[1] ?? ""

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as payload
        req.user = {
            id: decoded.userId,
            rule: decoded.rule
        }
        
        next()
        
    } catch (error) {
        return res.status(401).json({error: "Sua sessão expirou"})
    }
}
