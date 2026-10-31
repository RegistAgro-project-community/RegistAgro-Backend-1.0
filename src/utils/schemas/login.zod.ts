import z from "zod";

export const loginSchema = z.strictObject({
    captchaToken: z.string().optional(),
    email: z.string({message: "Chave email esperada e não foi recebido"}).email({message: "Email inválido"}).trim(),
    password: z.string().min(1).max(128)
})

export const farmSigninSchema = z.strictObject({
    captchaToken: z.string().optional(),
    nif: z.string({message: "Chave nif esperada e não foi recebido"}).trim().min(9, "O NIF deve conter 9 dígitos").max(9, "O NIF deve conter 9 dígitos"),
    password: z.string().min(1).max(128)
})

export const verifyOtpSchema = z.strictObject({
    email: z.string().trim().email(),
    code: z.string().regex(/^\d{6}$/),
})

export const refreshTokenSchema = z.strictObject({
    refreshToken: z.string().min(32).max(256),
})
