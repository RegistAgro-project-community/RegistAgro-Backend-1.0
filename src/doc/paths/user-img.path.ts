export const userProfilePhotoPath = {
    '/users/upload/profile': {
        post: {
            tags: ["Users"],
            summary: "Adicionar foto de perfil",
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            $ref: "#/components/schemas/ProfilePhoto"
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