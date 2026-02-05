export const userUpdatePath = {
    '/users/update': {
        put: {
            tags: ["Users"],
            summary: "Atualizar dados",
            security: [
                { bearerAuth: [] }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateData'
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
