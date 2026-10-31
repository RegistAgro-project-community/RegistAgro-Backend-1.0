import type { Response } from "express";
import { ConsoleLogger } from "../services/logger.js";

const logger = new ConsoleLogger();

function errorContext(error: unknown): Record<string, string> {
    const context: Record<string, string> = {
        errorType: error instanceof Error ? error.name : typeof error,
    };
    if (error && typeof error === "object" && "code" in error
        && typeof error.code === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(error.code)) {
        context.errorCode = error.code;
    }
    return context;
}

export function errors(res: Response, cause?: unknown){
    logger.error("http.controller_error", {
        requestId: String(res.locals.requestId ?? "unavailable"),
        ...errorContext(cause),
    });
    return res.status(500).json({
        error: "Não foi possível concluir a solicitação.",
        requestId: res.locals.requestId ?? "unavailable"
    })
}
