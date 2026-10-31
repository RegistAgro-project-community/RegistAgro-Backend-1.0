import express from "express";
import request from "supertest";
import { requireAdmin } from "../../src/middlewares/require-admin.js";

describe("requireAdmin", () => {
  const appWithUser = (rule?: string) => {
    const app = express();
    app.use((req, _res, next) => {
      if (rule) req.user = { id: "u1", rule };
      next();
    });
    app.get("/admin", requireAdmin, (_req, res) => res.sendStatus(204));
    return app;
  };

  it("requires an authenticated user", async () => {
    expect((await request(appWithUser()).get("/admin")).status).toBe(401);
  });

  it("rejects non-admin roles and allows admin", async () => {
    expect((await request(appWithUser("farm")).get("/admin")).status).toBe(403);
    expect((await request(appWithUser("admin")).get("/admin")).status).toBe(204);
  });
});
