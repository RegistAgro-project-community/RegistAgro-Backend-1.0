export const confirmPaymentPath = {
    '/orders/payment/confirm': {
        patch: {
            tags: ["Orders"],
            summary: "Confirmar pagamento por referência",
            security: [
                { bearerAuth: [] }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ConfirmPayment"
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
