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

    async cancelPayment(orderId: string){
        try {
            const isValidOrder = await prisma.orders.findFirst({
                where: {id: orderId}
            })

            if(!isValidOrder){
                return {error: "Pedido inválido"}
            }

            try {
                const paymentRow = await prisma.payments.updateMany({
                    where: {orderId: orderId},
                    data: {status: "canceled"}
                })

                if(paymentRow.count == 0){
                    return {error: "Pagamento não encontrado"}
                }

                return {message: "Pagamento realizado com sucesso"}
            } catch (error) {
                return {error: "Ocorreu um erro ao cancelar pagamento"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }
}
