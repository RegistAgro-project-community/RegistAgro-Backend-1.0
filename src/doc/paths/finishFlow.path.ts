export const finishFlowPath = {
    '/flow/carrier/finish/request/{id}': {
        patch: {
            tags: ["Flow"],
            summary: "Transportadoras terminam suas corridas",
            security: [
                {bearerAuth: {}}
            ],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: {
                        type: "string",
                        example: "60bf2304-50ce-4667-aa07-6e2cd246517e"
                    }
                }
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
