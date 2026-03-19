import z from "zod";

export const createVehiclesSchema = z.object({
    brand: z.string({message: "A chave brand foi esperada e não foi enviada"}).trim().min(3, "Marca inválida").max(25, "Marca muito extensa"),
    plate: z.string({message: "A chave plate foi esperada e não foi enviada"}).trim().min(12, "Matrícula inválida").max(12, "Matrícula inválida").toUpperCase(),
    category: z.string({message: "A chave type foi esperada e não foi enviada"}).trim(),
    capacity: z.number({message: "A chave capacity foi esperada e não foi enviada"}),
    unit: z.string({message: "A chave unit foi esperada e não foi enviada"}).trim()
}).superRefine((data, ctx) =>{
    if(data.unit != "t" && data.unit != "kg"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Unidade de stock inválida",
            path: ["unit"]
        })
    }

    if(data.category != "frigorifico" && data.category != "fechado" && data.category != "aberto_coberto" && data.category != "aberto"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O tipo de transporte deve ser: frigorifico, fechado, aberto_coberto, aberto",
            path: ["type"]
        })
    }

    const plateRegex = /^[A-Z]{3}-[0-9]{2}-[0-9]{2}-[A-Z]{2}$/
    const plateArr = data.plate.split("-")[0]

    if(!plateRegex.test(data.plate) || plateArr != "LDA"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Matrícula inválida",
            path: ["plate"]
        })
    }
})

export const hireCarrierSchema = z.object({
    orderId: z.string({message: "A chave orderId foi esperada e não foi enviada"}).trim(),
    vehicleId: z.string({message: "A chave vehicleId foi esperada e não foi enviada"}).trim()
}).superRefine((data, ctx) =>{
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if(!uuidRegex.test(data.orderId) || !uuidRegex.test(data.vehicleId)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Id inválido",
        })
    }
})
