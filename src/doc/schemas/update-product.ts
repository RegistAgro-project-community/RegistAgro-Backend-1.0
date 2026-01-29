export const updateProductSchema = {
    UpdateProduct: {
        type: "object",
        required: ["name", "description", "price", "stock", "unit"],
        properties: {
            name: {type: "string", example: "Banana"},
            description: {type: "string", example: "A melhor banana de Luanda"},
            price: {type: "number", example: 15200},
            stock: {type: "number", example: 30},
            unit: {type: "string", example: "t"}
        }
    }
}
