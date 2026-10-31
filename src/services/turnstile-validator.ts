import type { CaptchaValidator } from "./captcha-validator.js";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export class TurnstileValidator implements CaptchaValidator {
  constructor(
    private readonly secret = process.env.TURNSTILE_SECRET_KEY,
    private readonly hostname = process.env.TURNSTILE_HOSTNAME,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async validate(token?: string, remoteIp?: string): Promise<boolean> {
    if (!this.secret) return process.env.NODE_ENV !== "production";
    if (!this.hostname && process.env.NODE_ENV === "production") return false;
    if (!token) return false;

    try {
      const body = new URLSearchParams({ secret: this.secret, response: token });
      if (remoteIp) body.set("remoteip", remoteIp);
      const response = await this.fetcher(VERIFY_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) return false;
      const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
      return result.success === true
        && (!this.hostname || result.hostname === this.hostname)
        && result.action === "auth";
    } catch {
      return false;
    }
  }
}
