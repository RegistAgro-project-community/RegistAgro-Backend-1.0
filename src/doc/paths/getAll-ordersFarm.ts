export const getAllOrdersFarmsPath = {
    '/orders/farms/order/getAll': {
        get: {
            tags: ["Orders"],
            summary: "Visualizar todos os pedidos das fazendas",
            security: [
                { bearerAuth: [] }
            ],
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
