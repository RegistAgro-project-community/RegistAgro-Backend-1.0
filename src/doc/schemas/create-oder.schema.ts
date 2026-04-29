export const createOrderSchema = {
    CreateOrder: {
        type: "object",
        required: ["name", "qtd", "unit"],
        properties: {
            name: {type: "string", example: "Banana"},
            qtd: {type: "number", example: 10},
            unit: {type: "string", example: "kg"},
            delivery: {type: "string", example: "Rua C10 de baixo"}
        }
    }
}
