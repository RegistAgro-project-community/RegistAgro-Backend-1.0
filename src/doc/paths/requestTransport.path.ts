export const requestTransportPath = {
    "/transports/request": {
        post: {
            tags: ["Transport Requests"],
            summary: "Contratar transportadora pelo seu veículo",
            security: [
                {bearerAuth: {}}
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/RequestTransport"
                        }
                    }
                }
            },
            responses: {
                201: {description: "Created"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"},
                404: {description: "Not Found"},
                409: {description: "Conflict"}
            }
        }
    }
}
