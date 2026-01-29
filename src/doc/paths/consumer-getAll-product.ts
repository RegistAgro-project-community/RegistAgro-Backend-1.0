export const consumerGetAllProductPath = {
    '/products/consumers/getAll/{id}': {
        get: {
            tags: ["Products"],
            summary: "Consumidor visualiza todos osproduto de uma fazenda",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "5477da12-e907-4e4c-a4ed-23cadba77b3e"
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
