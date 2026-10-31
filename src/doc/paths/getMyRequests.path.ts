export const getMyRequestsPath = {
    '/transports/carrier/request/get': {
        get: {
            tags: ["Transport Requests"],
            summary: "Transportadoras visualizam suas solicitações de transporte",
            security: [
                {bearerAuth: {}}
            ],
            responses: {
                200: {
                    description: "SolicitaÃ§Ãµes da transportadora autenticada",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {type: "string"},
                                    requests: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["carrierId"],
                                            properties: {
                                                carrierId: {
                                                    type: "string",
                                                    description: "ID da transportadora associada à solicitação"
                                                }
                                            },
                                            additionalProperties: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"},
                404: {description: "Not Found"}
            }
        }
    }
}
