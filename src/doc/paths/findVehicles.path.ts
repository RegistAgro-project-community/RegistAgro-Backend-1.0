export const findVehiclesPath = {
    "/transports/farms/get/vehicle/{transport}": {
        get: {
            tags: ["Transports"],
            summary: "Encontrar veículos para contratar transportadora",
            security: [
                {bearerAuth: {}}
            ],
            parameters: [
                {
                    name: "transport",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "aberto_coberto"
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
