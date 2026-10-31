import z from "zod"
import type { Response } from "express"
import { ConsoleLogger } from "../services/logger.js"

const logger = new ConsoleLogger()

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

    const context: Record<string, string> = {
        requestId: String(res.locals.requestId ?? "unavailable"),
        errorType: error instanceof Error ? error.name : typeof error,
    }
    if (error instanceof Error && error.stack) {
        context.errorTrace = error.stack.split("\n").slice(1, 7).map(frame => frame.trim()).join(" | ").slice(0, 1200)
    }
    if (error && typeof error === "object" && "code" in error
        && typeof error.code === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(error.code)) {
        context.errorCode = error.code
    }
    logger.error("http.unexpected_controller_error", context)

    return res.status(500).json({
        error: "Não foi possível concluir a solicitação.",
        requestId: res.locals.requestId ?? "unavailable"
    })
}
