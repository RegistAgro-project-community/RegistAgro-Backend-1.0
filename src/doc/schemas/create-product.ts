export const createProductSchema = {
    CreateProduct: {
        type: "object",
        required: ["name", "description", "price", "stock", "unit", "type", "transport"],
        properties: {
            name: {type: "string", example: "Banana"},
            description: {type: "string", example: "A melhor banana de Luanda"},
            price: {type: "number", example: 15200},
            stock: {type: "number", example: 30},
            unit: {type: "string", example: "t"},
            type: {type: "string", example: "frutas"},
            transport: {type: "string", example: "frigorifico"}
        }
    }
}
