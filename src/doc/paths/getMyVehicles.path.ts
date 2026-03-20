export const getMyVehiclesPath = {
    '/transports/carriers/vehicles': {
        get: {
            tags: ["Transports"],
            summary: "Transportadoras visualizam seus transportes",
            security: [
                {bearerAuth: {}}
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
