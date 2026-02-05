export const getProductPath = {
    '/products/farms/get/{id}': {
        get: {
            tags: ["Products"],
            summary: "Ver um produto",
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