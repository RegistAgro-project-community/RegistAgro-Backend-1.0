export const acceptRequestSchema = {
    AcceptRequest: {
        type: "object",
        required: ["requestId", "latitude", "longitude"],
        properties: {
            requestId: {type: "string", example: "7611d529-0363-413a-8c36-a911fa42d052"},
            latitude: {type: "string", example: "-8.831788"},
            longitude: {type: "string", example: "13.262048"}
        }
    }
}
