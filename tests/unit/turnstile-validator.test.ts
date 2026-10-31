import { TurnstileValidator } from "../../src/services/turnstile-validator.js";

describe("TurnstileValidator", () => {
  const ok = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status });

  it("validates success, expected hostname and auth action", async () => {
    const fetcher = jest.fn().mockResolvedValue(ok({ success: true, hostname: "registagro.ao", action: "auth" }));
    const validator = new TurnstileValidator("secret", "registagro.ao", fetcher);
    await expect(validator.validate("captcha-token", "127.0.0.1")).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("siteverify"), expect.objectContaining({ method: "POST" }));
  });

  it.each([
    [{ success: false, hostname: "registagro.ao", action: "auth" }, 200],
    [{ success: true, hostname: "attacker.test", action: "auth" }, 200],
    [{ success: true, hostname: "registagro.ao", action: "login" }, 200],
    [{ success: true, hostname: "registagro.ao", action: "auth" }, 503],
  ])("rejects invalid provider response %#", async (payload, status) => {
    const validator = new TurnstileValidator("secret", "registagro.ao", jest.fn().mockResolvedValue(ok(payload, status)));
    await expect(validator.validate("token")).resolves.toBe(false);
  });

  it("rejects missing token when secret is set", async () => {
    const validator = new TurnstileValidator("secret", "registagro.ao", jest.fn());
    await expect(validator.validate()).resolves.toBe(false);
  });

  it("fails closed on network errors and in production without configuration", async () => {
    const broken = new TurnstileValidator("secret", undefined, jest.fn().mockRejectedValue(new Error("network")));
    await expect(broken.validate("token")).resolves.toBe(false);
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try { await expect(new TurnstileValidator(undefined).validate("token")).resolves.toBe(false); }
    finally { process.env.NODE_ENV = previous; }
  });

  it("requires an expected hostname in production", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const validator = new TurnstileValidator("secret", undefined, jest.fn().mockResolvedValue(ok({ success: true, action: "auth" })));
      await expect(validator.validate("token")).resolves.toBe(false);
    } finally { process.env.NODE_ENV = previous; }
  });
});
