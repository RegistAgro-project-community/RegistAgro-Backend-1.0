export const sentOrdersPath = {
    '/orders/consumers/order/sent': {
        get: {
            tags: ["Orders"],
            summary: "Ver todos os pedidos enviados",
            security: [
                { bearerAuth: [] }
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
