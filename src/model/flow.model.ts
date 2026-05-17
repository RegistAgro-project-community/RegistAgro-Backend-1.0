import { prisma } from "../../lib/prisma.js"
import { Payments } from "../services/payment.service.js"

export class FlowModel {
    async startFlow(userId: string, orderId: string){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {
                    farmId: userId,
                    farm: {status: "active"}
                }
            })

            if(!farmRow){
                return {error: "Informações inválidas"}
            }

            try {
                const orderRow = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        farmId: farmRow.id,
                        status: "incollection"
                    }
                })

                if(!orderRow){
                    return {info: "Pedido não encontrado ou inválido"}
                }

                try {
                    await prisma.transport_requests.updateMany({
                        where: {orderId: orderId},
                        data: {status: "em_transporte"}
                    })

                    await prisma.orders.update({
                        where: {
                            id: orderId
                        },
                        data: {status: "ongoing"}
                    })

                    return {message: "Escoamento iniciado com sucesso"}
                } catch (error) {
                    return {error: "Não foi possível começar escoamento"}
                }
            } catch (error) {
                return {error: "Não foi possível verificar pedido"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async finishFlow(userId: string, requestId: string){
        try {
            const carrierRow = await prisma.carriers.findFirst({
                where: {
                    carrierId: userId,
                    carrier: {status: "active"}
                }
            })

            if(!carrierRow){
                return {error: "Informações inválidas"}
            }

            try {
                const requestRow = await prisma.transport_requests.findFirst({
                    where: {
                        id: requestId,
                        carrierId: carrierRow.id,
                        status: "em_transporte"
                    },
                    select: {
                        order: {
                            select: {
                                consumer: {
                                    select: {
                                        consumer: {
                                            select: {
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                if(!requestRow){
                    return {info: "Solicitação não encontrada ou inválida"}
                }

                try {
                    const delivered_at = new Date()

                    await prisma.transport_requests.update({
                        where: {id: requestId},
                        data: {
                            status: "entregue",
                            delivered_at: delivered_at
                        }
                    })

                    const consumer: string = requestRow.order.consumer.consumer.name

                    return {message: `Escoamento finalizado. Espere a confirmação de ${consumer}`}
                } catch (error) {
                    return {error: "Não foi possível terminar o escoamento"}
                }
            } catch (error) {
                return {error: "Não foi possível verificar solicitação"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async completeOrder(userId: string, orderId: string){
        try {
            const consumerRow = await prisma.consumers.findFirst({
                where: {
                    consumerId: userId,
                    consumer: {status: "active"}
                }
            })

            if(!consumerRow){
                return {error: "Informações inválidas"}
            }

            try {
                const orderRow = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        consumerId: consumerRow.id,
                        status: "ongoing"
                    }
                })

                const requestRow = await prisma.transport_requests.findFirst({
                    where: {
                        orderId: orderId,
                        status: "entregue"
                    }
                })

                if(!orderRow || !requestRow){
                    return {info: "Pedido não encontrado ou inválido"}
                }

                try {
                    const service = new Payments()
                    const transaction = await service.releasePayment(orderId)

                    if(!transaction.success){
                        return {error: transaction.error}
                    }

                    await prisma.orders.update({
                        where: {id: orderId},
                        data: {status: "delivered"}
                    })

                    return {
                        message: "Pedido confirmado com sucesso",
                        proof: transaction.data
                    }
                } catch (error) {
                    return {error: "Não foi possível confirmar entrega"}
                }
            } catch (error) {
                return {error:"Não foi possível verificar pedido"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }
}
