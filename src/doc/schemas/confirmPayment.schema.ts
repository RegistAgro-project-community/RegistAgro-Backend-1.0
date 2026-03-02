export const confirmPaymentSchema = {
    ConfirmPayment: {
        type: "object",
        required: ["reference"],
        properties: {
            reference : {type: "string", example: "491856377"}
        }
    }
}
