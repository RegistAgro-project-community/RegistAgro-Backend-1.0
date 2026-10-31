import z from "zod";

export const idParamSchema = z.strictObject({ id: z.uuid() });
export const ruleParamSchema = z.strictObject({ rule: z.enum(["consumer", "carrier", "admin"]) });
export const transportParamSchema = z.strictObject({ transport: z.enum(["frigorifico", "fechado", "aberto_coberto", "aberto"]) });
export const nifParamSchema = z.strictObject({ nif: z.string().regex(/^\d{9}$/) });
export const codeParamSchema = z.strictObject({ code: z.string().regex(/^\d{6}$/) });
