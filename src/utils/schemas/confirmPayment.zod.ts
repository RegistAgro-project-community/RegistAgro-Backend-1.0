import z from "zod";

export const confirmPaymentSchema = z.strictObject({
    reference: z.string({message: "A chave reference esperada e não foi recebido"}).trim().min(9, "A referência deve ter 9 dígitos").max(9, "A referência deve ter 9 dígitos")
})
