export const createTransportPath = {
    "/transports/vehicle/create": {
        post: {
            tags: ["Transports"],
            summary: "Transportadoras cadastram um novo veículo",
            security: [
                {bearerAuth: {}}
            ],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            $ref: "#/components/schemas/CreateVehicle"
                        }
                    }
                }
            },
            responses: {
                201: {description: "Created"},
                400: {description: "Bad Request"},
                401: {description: "Unauthorized"},
                403: {description: "Forbidden"},
                409: {description: "Conflict"}
            }
        }
    }
}