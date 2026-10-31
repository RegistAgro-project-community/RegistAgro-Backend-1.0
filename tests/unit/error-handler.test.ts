import express from "express";
import request from "supertest";
import { createErrorHandler, createRequestId } from "../../src/middlewares/error-handler.js";
import type { Logger } from "../../src/services/logger.js";

describe("request ID and generic error handling", () => {
  it("returns a request ID and logs only its safe correlation context", async () => {
    const logger: Logger = { info: jest.fn(), error: jest.fn() };
    const app = express();
    app.use(createRequestId(() => "test-request-id"));
    app.get("/failure", (_req, _res, next) => next(new Error("secret details")));
    app.use(createErrorHandler(logger));
    const response = await request(app).get("/failure").set("authorization", "Bearer sensitive");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Não foi possível concluir a solicitação.", requestId: "test-request-id" });
    expect(response.headers["x-request-id"]).toBe("test-request-id");
    expect(logger.error).toHaveBeenCalledWith("http.unhandled_error", { requestId: "test-request-id" });
    const loggedArguments = JSON.stringify((logger.error as jest.Mock).mock.calls);
    expect(loggedArguments).not.toContain("secret details");
    expect(loggedArguments).not.toContain("sensitive");
  });

  it("creates a correlation ID if middleware was not mounted", async () => {
    const logger: Logger = { info: jest.fn(), error: jest.fn() };
    const app = express();
    app.get("/failure", (_req, _res, next) => next(new Error("private")));
    app.use(createErrorHandler(logger));
    const response = await request(app).get("/failure");
    expect(response.status).toBe(500);
    expect(response.body.requestId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(logger.error).toHaveBeenCalledWith("http.unhandled_error", { requestId: response.body.requestId });
  });
});
