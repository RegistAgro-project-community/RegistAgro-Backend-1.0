export const updateLocationPath = {
    '/location/carrier/update': {
        put: {
            tags: ["Location"],
            summary: "Transportadora atualiza a sua localização",
            security: [
                {bearerAuth: {}}
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/AcceptRequest'
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
