import { validateRuntimeEnv } from "../../src/config/env.js";

describe("runtime environment validation", () => {
  it("requires a sufficiently strong JWT secret", () => {
    expect(() => validateRuntimeEnv({ SECRET_KEY: "short", NODE_ENV: "development" })).toThrow("Configuração de ambiente inválida");
  });

  it("requires distributed rate limit and CAPTCHA configuration in production", () => {
    const secret = "a".repeat(40);
    expect(() => validateRuntimeEnv({ SECRET_KEY: secret, NODE_ENV: "production" })).toThrow("Produção exige");
    expect(() => validateRuntimeEnv({ SECRET_KEY: secret, NODE_ENV: "production", REDIS_URL: "redis://localhost:6379", TURNSTILE_SECRET_KEY: "captcha-secret", TURNSTILE_HOSTNAME: "registagro.ao", PAYMENT_TRANSPORT_PERCENT: "30", PAYMENT_REGISTAGRO_PERCENT: "5" })).not.toThrow();
    expect(() => validateRuntimeEnv({ SECRET_KEY: secret, NODE_ENV: "production", REDIS_URL: "redis://localhost:6379", TURNSTILE_SECRET_KEY: "captcha-secret", TURNSTILE_HOSTNAME: "registagro.ao" })).toThrow("split de pagamento");
  });
});
