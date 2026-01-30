export const userProfilePhotoSchema = {
    ProfilePhoto: {
        type: "object",
        required: ["img"],
        properties: {
            img: {type: "string", format: "binary", description: "Adicionar foto de perfil"}
        }
    }
}
