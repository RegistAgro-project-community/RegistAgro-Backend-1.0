import z from "zod";

export const createSchema = z.object({
    name: z.string({message: "Chave name esperada e não foi recebido"}).trim().min(3, "Nome muito curto").max(50, "Nome muito extenso"),
    description: z.string({message: "Chave description esperada e não foi recebido"}).trim().min(5, "Descrição muito curta"),
    price: z.number({message: "Chave price esperada e não foi recebido"}),
    stock: z.number({message: "Chave stock esperada e não foi recebido"}),
    unit: z.string({ message: "Chave unit esperada e não foi recebido"}).trim(),
    type: z.string({message: "Chave type esperada e não foi recebido"}).trim(),
    transport: z.string({message: "Chave transport esperada e não foi recebido"}).trim()
}).superRefine((data, ctx) =>{
    if(data.unit != "t" && data.unit != "kg"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Unidade de stock inválida",
            path: ["unit"]
        })
    }

    if(data.type != "frutas" && data.type != "vegetais" && data.type != "cereais" && data.type != "carnes" && data.type != "raizes" && data.type != "legumes"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tipo de produto invalido",
            validTypes: ["frutas", "vegetais", "cereais", "carnes", "raizes", "legumes"],
            path: ["type"]
        })
    }

    if(data.transport != "frigorifico" && data.transport != "fechado" && data.transport != "aberto_coberto" && data.transport != "aberto"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Transporte deve ser: frigorifico, fechado, aberto_coberto, aberto",
            path: ["transport"]
        })
    }
})

export const updateSchema = z.object({
    name: z.string({message: "Chave name esperada e não foi recebido"}).trim().min(3, "Nome muito curto").max(50, "Nome muito extenso"),
    description: z.string({message: "Chave description esperada e não foi recebido"}).trim().min(5, "Descrição muito curta"),
    price: z.number({message: "Chave price esperada e não foi recebido"}),
    stock: z.number({message: "Chave stock esperada e não foi recebido"}),
    unit: z.string({ message: "Chave unit esperada e não foi recebido"}).trim()
}).superRefine((data, ctx) =>{
    if(data.unit != "t" && data.unit != "kg"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A unidade de stock deve ser em t ou kg",
            path: ["unit"]
        })
    }
})
