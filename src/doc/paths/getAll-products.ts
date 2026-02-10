export const getAllProductsPath = {
    '/products/farms/get': {
        get: {
            tags: ["Products"],
            summary: "Ver todos meus produtos",
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
