export const productPhotoPath = {
    '/products/upload/{id}': {
        patch: {
            tags: ["Products"],
            summary: "Atualizar foto de um produto",
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
                    'multipart/form-data': {
                        schema: {
                            $ref: "#components/schemas/ProductPhoto"
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
