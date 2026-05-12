export const acceptRequestPath = {
    "/transports/carrier/request/accept": {
        patch: {
            tags: ["Transport Requests"],
            summary: "Aceitar pedido de transporte",
            security: [
                {bearerAuth: []}
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/AcceptRequest"
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
