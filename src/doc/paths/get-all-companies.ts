export const getAllCompaniesPath = {
    '/companies/get': {
        get: {
            tags: ["Company"],
            summary: "Visualiza o nif de todas as fazendas na AGT",
            responses: {
                200: { description: "OK" },
                400: {description: "Bad Request"},
                404: {description: "Not Found"}
            }
        }
    }
}
