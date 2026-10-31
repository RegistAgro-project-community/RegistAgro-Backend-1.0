import type{ Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { redisClient } from "../config/redis.config.js";
import { checkHealth } from "../services/health.service.js";

export function healthyRoute(req: Request, res: Response){
    return res.status(200).json({ok: "API is running"})
}

export async function healthRoute(_req: Request, res: Response) {
    const result = await checkHealth({
        database: async () => { await prisma.company.findFirst({ select: { id: true } }); },
        redis: async () => { await redisClient.ping(); },
    });
    return res.status(result.healthy ? 200 : 503).json({
        status: result.healthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        checks: { database: result.database ? "up" : "down", redis: result.redis ? "up" : "down" },
    });
}

export async function readyRoute(_req: Request, res: Response) {
    const result = await checkHealth({
        database: async () => { await prisma.company.findFirst({ select: { id: true } }); },
        redis: async () => { await redisClient.ping(); },
    });
    return res.status(result.healthy ? 200 : 503).json({ ready: result.healthy });
}
