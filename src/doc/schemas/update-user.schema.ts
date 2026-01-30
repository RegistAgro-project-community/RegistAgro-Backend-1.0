export const updateUserSchema = {
    UpdateData: {
        type: "object",
        required: ["name", "adress", "province"],
        properties: {
            name: {type: "string", example: "Euclénio Cadete"},
            adress: {type: "string", example: "Rangel/C10 de baixo"},
            province: {type: "string", example: "Luanda"}
        }
    }
}
