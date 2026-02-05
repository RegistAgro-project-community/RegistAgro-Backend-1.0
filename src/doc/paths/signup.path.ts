export const farmPassordPath = {
    '/auth/farm/signup': {
        post: {
            tags: ["Auth"],
            summary: "Definir senha das fazendas",
            security: [
                { bearerAuth: [] }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/FarmPass"
                        }
                    }
                }
            },
            responses: {
                201: {description: "Created"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"}
            }
        }
    }
}