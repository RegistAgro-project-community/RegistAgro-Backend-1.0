import z from "zod";

export const createOrderSchema = z.object({
    name: z.string({message: "Chave name esperada e não foi enviada"}).trim().min(3, "Nome muito curto").max
    (50, "Nome muito extenso"),
    value: z.number({message: "Chave value esperada e não foi enviada"}),
    qtd: z.number({message: "Chave qtd esperada e não foi enviada"}),
    unit: z.string({message: "Chave unit esperada e não foi enviada"}).trim()
}).superRefine((data, ctx) =>{
    if(data.unit != "kg" && data.unit != "t"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Unidade deve ser t ou kg",
            path: ["unit"]
        })
    }
})
