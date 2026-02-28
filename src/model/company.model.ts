import { prisma } from "../../lib/prisma"

export class CompanyModel {
    async getCompany(){
        try {
            const farmsCompanies = await prisma.company.findMany({
                select: {
                    nif: true,
                    name: true,
                    phone: true,
                    email: true,
                    location: true,
                    province: true,
                    municipality: true,
                }
            })

            if(farmsCompanies.length == 0){
                return {info: "Nenhuma empresa encontrada"}
            }

            return {
                message: "Empresas carregadas com sucesso",
                data: farmsCompanies
            }
        } catch (error) {
            return {error: "Não foi possível carregar empresas"}
        }
    }
}
