import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export function validAccount(){
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id

        const isValidUser = await prisma.users.findFirst({
            where: {
                id: userId,
                status: "active"
            }
        })

        if(!isValidUser){
            return res.status(401).json({error: "A sua conta está inativa. Contacte o nosso suporte para mais informações"})
        }

        next()
    }
}
