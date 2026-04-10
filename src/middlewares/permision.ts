import type { NextFunction, Request, Response } from "express";
import type { Rule } from "../../generated/prisma/enums";

export function permission(role: Rule){
    return (req: Request, res: Response, next: NextFunction) => {
        const userType = req.user?.rule as Rule | null

        if(userType != role){
            return res.status(403).json({error: "Não autorizado"})
        }

        next()
    }
}
