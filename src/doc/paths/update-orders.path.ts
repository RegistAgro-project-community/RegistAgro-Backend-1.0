export const updateOrdersPath = {
    '/orders/consumers/update/order/{id}': {
        put: {
            tags: ["Orders"],
            summary: "Atualizar pedidos",
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
                        example: "e6d2168a-4643-4ad5-aab7-c870a386aa17"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateOrder'
                        }
                    }
                }
            },
            responses: {
                200: {description: "OK"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"}
            }
        }
    }
}
