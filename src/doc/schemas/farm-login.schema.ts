export const farmLoginSchema = {
    FarmLogin: {
        type: "object",
        required: ["nif", "password"],
        properties: {
            nif: {type: "string", example: "500012345"},
            password: {type: "string", example: "FazendaVerde1.0"}
        }
    }
}
