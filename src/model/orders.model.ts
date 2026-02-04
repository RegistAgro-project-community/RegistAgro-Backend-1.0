import { id } from "zod/v4/locales";
import type { Stock } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { notFound } from "../errors/notFound";
import { paymentSplit } from "../utils/paymentSplit";
import { Payments } from "./payment.model";

export class OrdersModel {
    async create(userId: string, farmId: string, name: string, value: number, qtd: number, unit: Stock){
        try {
            const consumerId = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })
            
            if(!consumerId){
                return {error: "Informações inválidas"}
            }

            try {
                const productId = await prisma.products.findFirst({
                    where: {
                        farmId: farmId,
                        name: name,
                        status: "active"
                    },
                    select: {id: true}
                })

                if(!productId){
                    return {info: "Produto não encontrado"}
                }

                try {
                    const isAlreadyRequest = await prisma.orders.findFirst({
                        where: {
                            consumerId: consumerId.id,
                            farmId: farmId,
                            productId: productId.id,
                            status: "pendent"
                        }
                    })

                    if(isAlreadyRequest){
                        return {error: "Este pedido já foi feito"}
                    }

                    try {
                        const orderRow = await prisma.orders.create({
                            data: {
                                consumerId: consumerId.id,
                                farmId: farmId,
                                productId: productId.id,
                                qtd: qtd,
                                unit: unit,
                                value: value
                            }
                        })

                        const { transportValue, registagroValue, total } = paymentSplit(value)

                        const paymentModel = new Payments()

                        try {
                            const paid = await paymentModel.create(orderRow.id, transportValue, value, total)

                            if(paid.error){
                                return {error: paid.error}
                            }

                            return {message: paid.message}
                        } catch (error) {
                            return {error: error}
                        }
                    } catch (error) {
                        return {error: "Não foi possível fazer pedido"}
                    }
                } catch (error) {
                    return {error: "Não foi possível verificar pedido"}
                }
            } catch (error) {
                return {error: "Não foi possível verificar produto"}
            }
        } catch (error) {
            if(notFound(error)){
                return {info: "Usário não encontrado"}
            }

            return {error: "Ocorreu um erro inesperado"}
        }
    }

    async viewsAll(userId: string){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true}
            })

            if(!farmRow){
                return {error: "Informações inválidas"}
            }

            try {
                const ordersRow = await prisma.orders.findMany({
                    where: {farmId: farmRow.id}
                })

                if(ordersRow.length == 0){
                    return {info: "Você ainda não possui nenhum pedido"}
                }

                const orders = await Promise.all(
                    ordersRow.map(async column =>{
                        const consumerRow = await prisma.consumers.findFirst({
                            where: {id: column.consumerId},
                            select: {consumerId: true}
                        })

                        const farmRow = await prisma.farms.findFirst({
                            where: {id: column.farmId},
                            select: {farmId: true}
                        })
                        
                        return {
                            id: column.id,
                            consumer: await prisma.users.findFirst({
                                where: {id: consumerRow?.consumerId!},
                                select: {
                                    name: true,
                                    profile: true
                                }
                            }),
                            farm: await prisma.users.findFirst({
                                where: {id: farmRow?.farmId!},
                                select: {
                                    name: true,
                                    profile: true
                                }
                            }),
                            product: await prisma.products.findFirst({
                                where: {id: column.productId},
                                select: {
                                    name: true,
                                    photo: true, 
                                    type: true,
                                    price: true
                                }
                            }),
                            qtd: column.qtd,
                            unit: column.unit,
                            value: column.value,
                            status: column.status,
                            created_at: column.created_at
                        }
                    })
                )

                return {orders: orders}
            } catch (error) {
                return {error: "Não foi possível carregar os pedidos"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async accept(userId: string, orderId: string){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true}
            })

            if(!farmRow){
                return {error: "Informações inválidas"}
            }

            try {
                const isValidOrder = await prisma.orders.findFirst({
                    where: {
                        farmId: farmRow.id,
                        id: orderId
                    }
                })

                if(!isValidOrder){
                    return {info: "Pedido não encontrado"}
                }

                try {
                    await prisma.orders.update({
                        where: {
                            id: orderId,
                            farmId: farmRow.id
                        },
                        data: {status: "confirmed"}
                    })

                    return {message: "Pedido aceite com sucesso"}
                } catch (error) {
                    return {error: "Não foi possível aceitar pedido"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar pedido"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }

    async reject(userId: string, orderId: string){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true}
            })

            if(!farmRow){
                return {error: "Informações inválidas"}
            }

            try {
                const isValidOrder = await prisma.orders.findFirst
                ({
                    where: {
                        id: orderId,
                        farmId: farmRow.id
                    }
                })

                if(!isValidOrder){
                    return {info: "Pedido não encontrado"}
                }

                try {
                    await prisma.orders.update({
                        where: {
                            id: orderId,
                            farmId: farmRow.id
                        },
                        data: {
                            status: "rejected"
                        }
                    })

                    return {message: "Pedido rejeitado com sucesso"}
                } catch (error) {
                    return {error: "Não foi possível rejeitar pedido"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar pedido"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }
}
