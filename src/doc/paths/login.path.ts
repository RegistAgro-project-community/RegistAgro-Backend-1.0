export const loginPath = {
    '/auth/login': {
        post: {
            tags: ["Auth"],
            summary: "Login dos consumidores e transportadoras",
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/Login"
                        }
                    }
                }
            },
            responses: {
                400: {description: "Bad Request"},
                200: {description: "OK"}
            }
        }
    }
}
