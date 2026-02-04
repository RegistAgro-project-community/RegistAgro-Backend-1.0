import { prisma } from "../../lib/prisma"

export class Payments {
    async create(orderId: string, transportValue: number, productValue: number, total: number){
        try {
            const isPaid = await prisma.payments.findFirst({
                where: {
                    orderId: orderId,
                    transportValue: transportValue,
                    productValue: productValue,
                    value: total
                }
            })

            if(isPaid){
                return {error: "Este pagamento já foi efetuado"}
            }

            try {
                await prisma.payments.create({
                    data: {
                        orderId: orderId,
                        transportValue: transportValue,
                        productValue: productValue,
                        value: total
                    }
                })

                return {message: "Pagamento efetuado com sucesso"}
            } catch (error) {
                return {error: "Não foi possível efetuar pagamento"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar pagamento"}
        }
    }
}
