export const updateProductPath = {
    '/products/update/product/{id}': {
        put: {
            tags: ["Products"],
            summary: "Atualizar dados de um produto",
            security: [
                { bearerAuth: [] }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "c76766a9-a280-4871-801c-43e8a1346a2b"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#components/schemas/UpdateProduct'
                        }
                    }
                }
            },
            responses: {
                200: {description: "OK"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"},
                404: {description: "Not Found"}
            }
        }
    }
}
