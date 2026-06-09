import { id } from "zod/v4/locales"
import { prisma } from "../../lib/prisma.js"
import { referenceGenerate } from "../utils/referenceGenerate.js"
import { reduceStock } from "../utils/orderPrice.js"

interface PaymentResult {
    reference?: String
    error?: String
}

interface ReleasePayment {
    error?: string
    success: boolean
    data?: {
        reference: number
        total: string
        farmValue: string
        transportValue: string
        registagroValue: string
        status: string
    }
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
                    },
                    select: {
                        order: {
                            select: {
                                id: true,
                                qtd: true,
                                unit: true
                            }
                        }
                    }
                })

                if(!orderRow){
                    return {error: "Referência inválida"}
                }

                const productRow = await prisma.orders.findFirst({
                    where: {id: orderRow.order.id},
                    select: {
                        product: {
                            select: {
                                id: true,
                                stock: true,
                                unit: true
                            }
                        }
                    }
                })
                
                if(!productRow){
                    return {error: "Não é possível efetuar pagamento"}
                }

                const stock = reduceStock(orderRow.order.qtd, orderRow.order.unit, productRow.product.stock, productRow.product.unit)

                await prisma.products.update({
                    where: {id: productRow.product.id},
                    data: {
                        stock: stock.productQtd,
                        unit: stock.productUnit
                    }
                })

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

    async releasePayment(orderId: string): Promise<ReleasePayment>{
        try {
            const paymentData = await prisma.transport_requests.findFirst({
                where: {orderId: orderId},
                select: {
                    carrierId: true,
                    order: {
                        select: {farmId: true}
                    }
                }
            })
            
            const farmId = paymentData!.order.farmId
            const carrierId = paymentData!.carrierId

            const farmBalance = await prisma.farms.findFirst({
                where: {id: farmId},
                select: {balance: true}
            }) 

            const carrierBalance = await prisma.carriers.findFirst({
                where: {id: carrierId},
                select: {balance: true}
            })

            var paymentRow = await prisma.payments.findFirst({
                where: {
                    orderId: orderId,
                    status: "retained"
                },
            })

            if(!paymentRow){
                return {error: "Não é possível realizar transação", success: false}
            }

            try {
                const farmValue = paymentRow.farmValue + farmBalance!.balance
                const carrierValue = paymentRow.transportValue + carrierBalance!.balance


                await prisma.farms.update({
                    where: {id: farmId},
                    data: {balance: farmValue}
                })

                await prisma.carriers.update({
                    where: {id: carrierId},
                    data: {balance: carrierValue}
                })

                await prisma.payments.updateMany({
                    where: {orderId: orderId},
                    data: {status: "released"}
                })

                paymentRow = await prisma.payments.findFirst({
                    where: {orderId: orderId},
                })

                return {
                    success: true, 
                    data: {
                        reference: Number(paymentRow!.reference),
                        farmValue: `${paymentRow!.farmValue}Kz`,
                        transportValue: `${paymentRow!.transportValue}Kz`,
                        registagroValue: `${paymentRow!.registagroValue}Kz`,
                        total: `${paymentRow!.value}Kz`,
                        status: paymentRow!.status
                    }
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao realizar transação", success: false}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao buscar informações", success: false}
        }
    }
}
