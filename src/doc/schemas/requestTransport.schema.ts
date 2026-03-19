export const requestTransportSchema = {
    RequestTransport: {
        type: "object",
        required: ["orderId", "vehicleId"],
        properties: {
            orderId: {type: "string", example: "406e6da5-9c4c-4da7-9d4c-3fc560d8e1af"},
            vehicleId: {type: "string", example: "1e854eb1-25d0-42b1-a990-2237b6a57d39"}
        }
    }
}
