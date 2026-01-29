export const nifPath = {
    '/auth/signup/nif/{nif}': {
        get: {
            tags: ['Auth'],
            summary: "Validar código de verificação",
            parameters: [
                {
                    name: 'nif',
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "500012345"
                    }
                }
            ],
            responses: {
                200: {description: "OK"},
                400: {description: "Bad Request"}
            }
        }
    }
}
