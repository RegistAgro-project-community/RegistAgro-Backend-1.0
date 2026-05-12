export const getMyRequestsPath = {
    '/transports/carrier/request/get': {
        get: {
            tags: ["Transport Requests"],
            summary: "Transportadoras visualizam suas solicitações de transporte",
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
