import type { Response } from "express";

export function errors(res: Response){
    return res.status(500).json({error: "Ocorreu um erro inesperado"})
}
