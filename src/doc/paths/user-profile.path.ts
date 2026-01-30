export const userProfilePath = {
    '/users/profile': {
        get: {
            tags: ["Users"],
            summary: "Ver meus dados",
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
