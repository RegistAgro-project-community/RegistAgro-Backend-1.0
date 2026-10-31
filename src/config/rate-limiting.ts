import { createHmac } from "node:crypto";
import { ipKeyGenerator, rateLimit, type Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "./redis.config.js";

export function rateLimitIdentity(ip: string | undefined, body: unknown): string {
  const address = ipKeyGenerator(ip ?? "unknown");
  const payload = body && typeof body === "object" ? body as { email?: unknown; nif?: unknown } : {};
  const identity = typeof payload.email === "string" ? payload.email.toLowerCase().trim()
    : typeof payload.nif === "string" ? payload.nif.trim() : "unknown";
  const identityDigest = createHmac("sha256", process.env.SECRET_KEY ?? "registagro-test-key")
    .update(identity)
    .digest("hex");
  return `${address}:${identityDigest}`;
}

function store(prefix: string): Options["store"] | undefined {
  if (!process.env.REDIS_URL) return undefined;
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });
}

export function createLimiter(prefix: string, windowMs: number, limit: number, identity = false) {
  const rateLimitStore = store(prefix);
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true,
    ...(rateLimitStore ? { store: rateLimitStore } : {}),
    ...(identity ? {
      keyGenerator: (req) => {
        return rateLimitIdentity(req.ip, req.body);
      },
    } : {}),
    handler: (_req, res) => res.status(429).json({
      error: "Limite de requisições excedido",
      retryAfter: `${Math.ceil(windowMs / 1000)} segundos`,
    }),
  });
}

export const limiter = createLimiter("api", 60_000, 60);
export const authLimiter = createLimiter("auth", 15 * 60_000, 5, true);
export const paymentLimiter = createLimiter("payment", 60_000, 10);
export const refreshLimiter = createLimiter("refresh", 60_000, 10);
