export const farmLoginSchema = {
    FarmLogin: {
        type: "object",
        required: ["nif", "password", "captchaToken"],
        properties: {
            nif: {type: "string", example: "500012345"},
            password: {type: "string", example: "your-password"},
            captchaToken: {
                type: "string",
                description: "Token temporário gerado pelo widget Turnstile (não é a Site Key). A action do widget deve ser auth."
            }
        }
    }
}
