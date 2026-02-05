export const createOrderPath = {
    '/orders/create/farm/{id}': {
        post: {
            tags: ["Orders"],
            summary: "Fazer pedido",
            security: [
                { bearerAuth: [] }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        example: "90a35095-f87a-425b-b005-5c68a19eb275"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/CreateOrder'
                        }
                    }
                }
            },

            responses: {
                201: {description: "Created"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"},
                404: {description: "Not Found"}
            }
        }
    }
}
