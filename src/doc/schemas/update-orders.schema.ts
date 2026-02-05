export const updateOrdersSchema = {
    UpdateOrder: {
        type: "object",
        required: ["qtd", "unit"],
        properties: {
            qtd: {type: "number", example: 20},
            unit: {type: "string", example: "kg"}
        }
    }
}
