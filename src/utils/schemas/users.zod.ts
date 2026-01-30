import z from "zod";

export const updateUser = z.object({
    name: z.string({message: "Chave name esperada e não foi recebido"}).trim().min(3, "Nome muito curto").max(50, "Nome muito extenso"),
    adress: z.string({message: "Chave adress esperada e não foi recebido"}).trim().min(3, "Endereço inválido"),
    province: z.string({message: "Chave province esperada e não foi recebido"}).trim()
}).superRefine((data, ctx) => {
    if(data.province != "Luanda" && data.province != "Bengo"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["province"],
            message: "A provincía deve ser Luanda ou Bengo"
        })
    }
})
