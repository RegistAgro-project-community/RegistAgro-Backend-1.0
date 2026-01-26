import z from "zod"
import type { Response } from "express"

export function zodError(error: unknown, res: Response){
    if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => {
            const formatted: any = {
                key: err.path[0],
                message: err.message
            }
            
            // Adiciona minimum apenas se existir
            if ('minimum' in err) {
                formatted.minimum = err.minimum
            }
            
            return formatted
        })

        return res.status(400).json({
            error: errors
        })
    }

    return res.status(500).json({error: "Ocorreu um erro inesperado"})
}
