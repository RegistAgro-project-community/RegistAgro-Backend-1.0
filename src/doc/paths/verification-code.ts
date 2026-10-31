export const verificationCodePath = {
    '/auth/signup/verify/{code}': {
        get: {
            tags: ['Auth'],
            summary: "Valida código de verificação",
            parameters: [
                {
                    name: "email",
                    in: "query",
                    required: true,
                    schema: { type: "string", format: "email" }
                },
                {
                    name: "code",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        pattern: "^[0-9]{6}$",
                        example: 906941
                    }
                }
            ],
            responses: {
                202: {description: "Accepted"},
                400: {description: "Bad Request"},
            }
        }
    },
    '/auth/signup/verify': {
        post: {
            tags: ['Auth'],
            summary: "Confirma código OTP associado ao email",
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: "#/components/schemas/VerifyOtp" } } }
            },
            responses: { 202: { description: "Conta verificada e tokens emitidos" }, 400: { description: "Email/código inválido ou expirado" } }
        }
    }
}
