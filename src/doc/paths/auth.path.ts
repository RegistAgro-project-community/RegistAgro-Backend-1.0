export const signupPath = {
    '/auth/signup/{rule}': {
        post: {
            tags: ["Auth"],
            summary: "Cadastrar consumidores e transportadoras",
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
                            $ref: '#/components/schemas/CreateUser'
                        }
                    }
                }
            },
            responses: {
                400: {description: "Bad request"},
                201: {description: "Created"}
            }
        }
    }
}
