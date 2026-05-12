export const getLocationPath = {
    '/location/get/coordinates/order/{id}': {
        get: {
            tags: ["Location"],
            summary: "Consumidores e fazendas carregam a localização da transportadora",
            security: [
                {bearerAuth: {}}
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "60bf2304-50ce-4667-aa07-6e2cd246517e"
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
