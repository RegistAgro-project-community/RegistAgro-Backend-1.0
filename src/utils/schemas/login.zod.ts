import z from "zod";

export const loginSchema = z.object({
    email: z.string({message: "Chave email esperada e não foi recebido"}).email({message: "Email inválido"}).trim(),
    password: z.string()
})

export const farmSigninSchema = z.object({
    nif: z.string({message: "Chave nif esperada e não foi recebido"}).trim().min(9, "O NIF deve conter 9 dígitos").max(9, "O NIF deve conter 9 dígitos"),
    password: z.string()
})
