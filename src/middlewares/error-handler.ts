import { randomUUID } from "node:crypto";
import type { ErrorRequestHandler, RequestHandler } from "express";
import type { Logger } from "../services/logger.js";
import { ConsoleLogger } from "../services/logger.js";

declare global {
  namespace Express {
    interface Request { requestId?: string }
  }
}

export function createRequestId(factory: () => string = randomUUID): RequestHandler {
  return (req, res, next) => {
    const id = factory();
    req.requestId = id;
    res.locals.requestId = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}

export const requestId = createRequestId();

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (_error, req, res, _next) => {
    const id = req.requestId ?? randomUUID();
    logger.error("http.unhandled_error", { requestId: id });
    res.status(500).json({ error: "Não foi possível concluir a solicitação.", requestId: id });
  };
}

export const errorHandler = createErrorHandler(new ConsoleLogger());
