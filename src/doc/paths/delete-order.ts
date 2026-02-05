export const deleteOrderPath = {
    '/orders/consumers/delete/order/{id}': {
        delete: {
            tags: ["Orders"],
            summary: "Apagar pedidos",
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
            responses: {
                200: {description: "OK"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"}
            }
        }
    }
}
