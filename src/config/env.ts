import z from "zod";
import { readPaymentSplitPolicy } from "../utils/paymentSplit.js";

const schema = z.object({
  SECRET_KEY: z.string().min(32),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  REDIS_URL: z.string().url().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TURNSTILE_HOSTNAME: z.string().optional(),
  PAYMENT_TRANSPORT_PERCENT: z.string().optional(),
  PAYMENT_REGISTAGRO_PERCENT: z.string().optional(),
});

export function validateRuntimeEnv(values: NodeJS.ProcessEnv = process.env): void {
  const parsed = schema.safeParse(values);
  if (!parsed.success) throw new Error("Configuração de ambiente inválida; verifique as variáveis obrigatórias.");
  if (parsed.data.NODE_ENV === "production"
    && (!parsed.data.REDIS_URL || !parsed.data.TURNSTILE_SECRET_KEY || !parsed.data.TURNSTILE_HOSTNAME)) {
    throw new Error("Produção exige REDIS_URL, TURNSTILE_SECRET_KEY e TURNSTILE_HOSTNAME.");
  }
  if (parsed.data.NODE_ENV === "production"
    && (!parsed.data.PAYMENT_TRANSPORT_PERCENT || !parsed.data.PAYMENT_REGISTAGRO_PERCENT)) {
    throw new Error("Produção exige configuração explícita de split de pagamento.");
  }
  readPaymentSplitPolicy(values);
}
