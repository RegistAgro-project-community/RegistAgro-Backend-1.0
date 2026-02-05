export const consumerGetAProductPath = {
    '/products/consumers/farm/{farmId}/product/{id}': {
        get: {
            tags: ["Products"],
            summary: "Consumidor visualiza um produto",
            security: [
                { bearerAuth: [] }
            ],
            parameters: [
                {
                    name: "farmId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "5477da12-e907-4e4c-a4ed-23cadba77b3e"
                    }
                },
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
                200: {description: "ÕK"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"},
                404: {description: "Not Found"}
            }
        }
    }
}
