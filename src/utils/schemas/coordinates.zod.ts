import z from "zod";

export const createCoordenateSchema = z.strictObject({
    requestId: z.string({message: "A chave requestId foi esperada e não foi enviada"}).trim(),
    latitude: z.string({message: "A chave latitude foi esperada e não foi enviada"}).trim().refine(value => {
        const n = Number(value); return Number.isFinite(n) && n >= -18 && n <= -4
    }, "Latitude fora de Angola"),
    longitude: z.string({message: "A chave longitude foi esperada e não foi enviada"}).trim().refine(value => {
        const n = Number(value); return Number.isFinite(n) && n >= 11 && n <= 24
    }, "Longitude fora de Angola")
})
