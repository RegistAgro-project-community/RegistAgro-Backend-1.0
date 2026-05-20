export const loginPath = {
    '/auth/login/{rule}': {
        post: {
            tags: ["Auth"],
            summary: "Login dos consumidores e transportadoras",
            parameters: [
                {
                    name: "rule",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "consumer"
                    }
                }
            ],
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
