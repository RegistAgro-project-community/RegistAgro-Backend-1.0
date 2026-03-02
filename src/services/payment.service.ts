import { prisma } from "../../lib/prisma.js"
import { referenceGenerate } from "../utils/referenceGenerate.js"

interface PaymentResult {
    reference?: String
    error?: String
}

export class Payments {
    async create(orderId: string, transportValue: number, productValue: number, registagroValue: number, farmValue: number, total: number): Promise<PaymentResult>{
        try {
            const isPaid = await prisma.payments.findFirst({
                where: {
                    orderId: orderId,
                    transportValue: transportValue,
                    productValue: productValue,
                    registagroValue: registagroValue,
                    value: total,
                    OR: [
                        {status: "released"},
                        {status: "retained"}
                    ]
                }
            })

            if(isPaid){
                return {error: "Este pagamento já foi efetuado"}
            }

            const reference = referenceGenerate()

            try {
                await prisma.payments.create({
                    data: {
                        orderId: orderId,
                        reference: String(reference),
                        transportValue: transportValue,
                        productValue: productValue,
                        registagroValue: registagroValue,
                        farmValue: farmValue,
                        value: total
                    }
                })

                return {reference: String(reference)}
            } catch (error) {
                return {error: "Não foi possível gerar referência"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar pagamento"}
        }
    }

    async confirmPayment(userId: string, reference: string){
        try {
            const userRow = await prisma.consumers.findFirst({
                where: {
                    consumer: {
                        id: userId,
                        status: "active"
                    }
                }
            })

            if(!userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const orderRow = await prisma.payments.findFirst({
                    where: {
                        reference: reference,
                        order: {consumerId: userRow.id},
                        status: "pendent"
                    }
                })

                if(!orderRow){
                    return {error: "Referência inválida"}
                }

                try {
                    const updated = await prisma.payments.update({
                        where: {
                            reference: reference,
                            order: {consumerId: userRow.id},
                            status: "pendent"
                        },
                        data: {status: "retained"}
                    })

                    if(!updated){
                        return {error: "Não foi possível confirmar pagamento"}
                    }

                    await prisma.orders.updateMany({
                        where: {
                            consumerId: userRow.id,
                            status: "inactive",
                            payments: {
                                some: {
                                    AND: [
                                        {reference: reference},
                                        {status: "retained"}
                                    ]
                                }
                            }
                        },
                        data: {status: "pendent"}
                    })

                    return {
                        message: "Pedido realizado com sucesso. O seu pagamento ficará retido até a sua confirmação"
                    }
                } catch (error) {
                    return {error: "Ocorreu um erro ao confirmar pagamento"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar pedido"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
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

                return {message: "Pagamento cancelado com sucesso"}
            } catch (error) {
                return {error: "Ocorreu um erro ao cancelar pagamento"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }
}
