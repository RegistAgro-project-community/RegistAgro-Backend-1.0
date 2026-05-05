import z from "zod";

export const createCoordenateSchema = z.object({
    requestId: z.string({message: "A chave requestId foi esperada e não foi enviada"}).trim(),
    latitude: z.string({message: "A chave latitude foi esperada e não foi enviada"}).trim(),
    longitude: z.string({message: "A chave longitude foi esperada e não foi enviada"}).trim()
})
