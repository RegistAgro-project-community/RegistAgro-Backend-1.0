import { TurnstileValidator } from "./turnstile-validator.js";

const validator = new TurnstileValidator();

/** Retained functional entry point; controllers can inject CaptchaValidator directly. */
export function verifyCaptcha(token?: string, remoteIp?: string): Promise<boolean> {
  return validator.validate(token, remoteIp);
}
