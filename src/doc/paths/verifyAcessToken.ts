export const verifyAcessTokenPath = {
    '/token': {
        get: {
            tags: ['Token'],
            summary: "Verifica se o token de acesso é válido",
            security: [
                { bearerAuth: [] }
            ]
        },
        responses: {
            200: {description: "OK"},
            401: {description: "Unauthorized"},
            403: {description: "Forbidden"}
        }
    }
}
