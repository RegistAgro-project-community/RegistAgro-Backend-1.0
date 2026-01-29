export const loginSchema = {
    Login: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: {type: "string", example: "eucleniocadete@gmail.com"},
            password: {type: "string", example: "Euclenio@1"}
        }
    }
}
