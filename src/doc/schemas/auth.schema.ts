export const signupSchema = {
    CreateUser: {
        type: "object",
        required: [
            "name",
            "email",
            "phone",
            "adress",
            "province",
            "pass1",
            "pass2"
        ],
        properties: {
            name: { type: "string", example: "Euclénio Cadete" },
            email: { type: "string", example: "eucleniocadete@gmail.com" },
            phone: { type: "string", example: "941877294" },
            adress: { type: "string", example: "Rangel/C10 de baixo" },
            province: { type: "string", example: "Luanda" },
            pass1: { type: "string", example: "Euclenio@1" },
            pass2: { type: "string", example: "Euclenio@1" }
        }
    }
}