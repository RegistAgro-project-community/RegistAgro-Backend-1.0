export const createTransportSchema = {
    CreateVehicle: {
        type: "object",
        required: ["photo", "data"],
        properties: {
            photo: {type: "string", format: "binary", description: "Adicionar foto da viatura"},
            data: {
                type: "object",
                required: ["brand", "plate", "category", "capacity", "unit"],
                properties: {
                    brand: {type: "string", example: "Toyota Hilux"},
                    plate: {type: "string", example: "LDA-28-62-RP"},
                    category: {type: "string", example: "aberto_coberto"},
                    capacity: {type: "number", example: 20},
                    unit: {type: "string", example: "kg"},
                }
            }
        }
    }
}
