export const getDirectionPath = {
    '/location/carrier/direction/request/{id}': {
        get: {
            tags: ["Location"],
            summary: "Transportadoras pegam a direção até a fazenda",
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
                        example: "cef6a53b-b982-4bd3-9d02-761945646255"
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
