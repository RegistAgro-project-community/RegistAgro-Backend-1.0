import express from "express";
import request from "supertest";
import { createRequestId } from "../../src/middlewares/error-handler.js";
import { notFoundHandler } from "../../src/middlewares/not-found.js";

it("returns a generic 404 with request ID", async () => {
  const app = express();
  app.use(createRequestId(() => "not-found-id"));
  app.use(notFoundHandler);
  const response = await request(app).get("/missing");
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ error: "Recurso não encontrado.", requestId: "not-found-id" });
});

it("uses a safe fallback request ID when middleware is absent", async () => {
  const app = express();
  app.use(notFoundHandler);
  const response = await request(app).get("/missing");
  expect(response.status).toBe(404);
  expect(response.body.requestId).toBe("unavailable");
});
