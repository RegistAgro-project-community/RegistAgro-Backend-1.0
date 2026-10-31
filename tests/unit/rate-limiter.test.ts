import express from "express";
import request from "supertest";
import { createLimiter, rateLimitIdentity } from "../../src/config/rate-limiting.js";

jest.mock("../../src/config/redis.config.js", () => ({ redisClient: { sendCommand: jest.fn() } }));

describe("rate limiter policy", () => {
  it("normalizes supported login identities and handles unknown payloads", () => {
    const emailKey = rateLimitIdentity("127.0.0.1", { email: " USER@Example.com " });
    expect(emailKey).toBe(rateLimitIdentity("127.0.0.1", { email: "user@example.com" }));
    expect(emailKey).not.toContain("user@example.com");
    expect(rateLimitIdentity("127.0.0.1", { nif: " 123456789 " })).toBe(rateLimitIdentity("127.0.0.1", { nif: "123456789" }));
    expect(rateLimitIdentity(undefined, undefined)).toBe(rateLimitIdentity(undefined, { email: 12, nif: false }));
  });
  it("returns 429 after the configured request count", async () => {
    const app = express();
    app.use(express.json());
    app.use(createLimiter("test-auth", 60_000, 2, true));
    app.post("/login", (_req, res) => res.sendStatus(204));

    expect((await request(app).post("/login").send({ email: "a@example.com" })).status).toBe(204);
    expect((await request(app).post("/login").send({ email: "a@example.com" })).status).toBe(204);
    const limited = await request(app).post("/login").send({ email: "a@example.com" });
    expect(limited.status).toBe(429);
    expect(limited.body.error).toBe("Limite de requisições excedido");
    expect(limited.headers["ratelimit-limit"]).toBe("2");
  });

  it("keeps counters separate by login identity", async () => {
    const app = express();
    app.use(express.json());
    app.use(createLimiter("test-identity", 60_000, 1, true));
    app.post("/login", (_req, res) => res.sendStatus(204));
    expect((await request(app).post("/login").send({ email: "a@example.com" })).status).toBe(204);
    expect((await request(app).post("/login").send({ email: "b@example.com" })).status).toBe(204);
  });

  it("configures the shared Redis store when REDIS_URL is available", () => {
    const previous = process.env.REDIS_URL;
    process.env.REDIS_URL = "redis://localhost:6379";
    try { expect(createLimiter("test-redis", 60_000, 2)).toBeInstanceOf(Function); }
    finally {
      if (previous === undefined) delete process.env.REDIS_URL;
      else process.env.REDIS_URL = previous;
    }
  });
});
