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
            "pass2",
            "captchaToken"
        ],
        properties: {
            name: { type: "string", example: "Euclénio Cadete" },
            email: { type: "string", format: "email", example: "user@example.com" },
            phone: { type: "string", example: "941877294" },
            adress: { type: "string", example: "Rangel/C10 de baixo" },
            province: { type: "string", example: "Luanda" },
            pass1: { type: "string", example: "ExamplePass123!" },
            pass2: { type: "string", example: "ExamplePass123!" },
            captchaToken: {
                type: "string",
                description: "Token temporário gerado pelo widget Turnstile (não é a Site Key). A action do widget deve ser auth."
            }
        }
    }
}
