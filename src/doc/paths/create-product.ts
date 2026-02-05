export const createProductPath = {
    '/products/create': {
        post: {
            tags: ["Products"],
            summary: "Cadastrar Produto",
            security: [
                { bearerAuth: [] }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/CreateProduct'
                        }
                    }
                }
            },
            responses: {
                201: {description: "Created"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"}
            }
        }
    }
}
