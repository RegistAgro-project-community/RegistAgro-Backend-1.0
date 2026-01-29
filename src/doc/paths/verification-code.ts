export const verificationCodePath = {
    '/auth/signup/verify/{code}': {
        get: {
            tags: ['Auth'],
            summary: "Valida código de verificação",
            parameters: [
                {
                    name: "code",
                    in: "path",
                    required: true,
                    schema: {
                        type: "number",
                        example: 906941
                    }
                }
            ],
            responses: {
                202: {description: "Accepted"},
                400: {description: "Bad Request"},
            }
        }
    }
}
