export const productPhotoSchema = {
    ProductPhoto: {
        type: "object",
        required: ["img"],
        properties: {
            img: {type: "string", format: "binary", description: "Adicionar foto a um produto"}
        }
    }
}
