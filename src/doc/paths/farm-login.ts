export const farmLoginPath = {
    '/auth/farm/login': {
        post: {
            tags: ["Auth"],
            summary: "Login das fazendas",
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/FarmLogin"
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