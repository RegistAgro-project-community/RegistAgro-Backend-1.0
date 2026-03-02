import z from "zod";

export const confirmPaymentSchema = z.object({
    reference: z.string({message: "A chave reference esperada e não foi recebido"}).trim().min(9, "A referência deve ter 9 dígitos").max(9, "A referência deve ter 9 dígitos")
})
