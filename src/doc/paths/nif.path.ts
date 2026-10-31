export const nifPath = {
    '/auth/signup/nif/{nif}': {
        get: {
            tags: ['Auth'],
            summary: "Verifica nif das fazendas",
            parameters: [
                {
                    name: 'nif',
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "500012345"
                    }
                },
                {
                    name: "x-captcha-token",
                    in: "header",
                    required: true,
                    description: "Token temporário gerado pelo widget Turnstile; não é a Site Key.",
                    schema: {type: "string"}
                }
            ],
            responses: {
                200: {description: "OK"},
                400: {description: "Bad Request"}
            }
        }
    }
}
