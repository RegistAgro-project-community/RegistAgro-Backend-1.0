export const loginSchema = {
    Login: {
        type: "object",
        required: ["email", "password", "captchaToken"],
        properties: {
            email: {type: "string", format: "email", example: "user@example.com"},
            password: {type: "string", example: "your-password"},
            captchaToken: {
                type: "string",
                description: "Token temporário gerado pelo widget Turnstile (não é a Site Key). A action do widget deve ser auth."
            }
        }
    }
}
