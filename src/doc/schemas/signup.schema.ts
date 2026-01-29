export const farmPassSchema = {
    FarmPass: {
        type: "object",
        required: ["name", "email", "phone", "adress", "province", "pass1", "pass2"],
        properties: {
            name: { type: "string", example: "Fazenda Verde Luanda" },
            email: { type: "string", example: "verde.luanda1@gmail.com" },
            phone: { type: "string", example: "923456001" },
            adress: { type: "string", example: "Viana" },
            province: { type: "string", example: "Luanda" },
            pass1: { type: "string", example: "FazendaVerde1.0" },
            pass2: { type: "string", example: "FazendaVerde1.0" }
        }
    }
}
