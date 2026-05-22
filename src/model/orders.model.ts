import type { Province, Stock } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../errors/notFound.js";
import { paymentSplit } from "../utils/paymentSplit.js";
import { Payments } from "../services/payment.service.js";
import { orderPrice } from "../utils/orderPrice.js";
import { verifyStock } from "../utils/verifyStock.js";
import { getAltLong } from "../services/location.service.js";

const paymentModel = new Payments()

export class OrdersModel {
    async create(userId: string, farmId: string, name: string, qtd: number, unit: Stock, delivery: string | undefined){
        try {
            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            const consumerId = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })
            
            if(!consumerId || !userRow){
                return {error: "Informações inválidas"}
            }

            const farmIdRow = await prisma.farms.findFirst({
                where: {
                    farm: {id: farmId}
                },
                select: {id: true}
            })

            if(!farmIdRow){
                return {error: "Essa fazenda não existe"}
            }

            if(qtd < 10 && unit == "kg"){
                return {error: "Não é possível fazer pedido de produtos abaixo de 10Kg"}
            }

            try {
                const productRow = await prisma.products.findFirst({
                    where: {
                        farmId: farmIdRow?.id!,
                        name: name,
                        status: "active"
                    },
                    select: {
                        id: true,
                        price: true,
                        stock: true,
                        unit: true
                    }
                })

                if(!productRow){
                    return {info: "Produto não encontrado"}
                }

                const isValidStock = verifyStock(qtd, unit, productRow.stock, productRow.unit)

                if(!isValidStock){
                    return {error: "Estoque insuficiente"}
                }

                const price = orderPrice(productRow.price, qtd, unit)

                try {
                    const isAlreadyRequest = await prisma.orders.findFirst({
                        where: {
                            consumerId: consumerId.id,
                            farmId: farmIdRow?.id!,
                            productId: productRow.id,
                            OR: [
                                {status: "pendent"},
                                {status: "ongoing"},
                            ]
                        }
                    })

                    if(isAlreadyRequest){
                        if(isAlreadyRequest.status == "ongoing"){
                            return {error: "Este pedido já está em andamento"}
                        }

                        try {
                            const farmName = await prisma.farms.findFirst({
                                where: {id: isAlreadyRequest.farmId},
                                select: {
                                    farm: {
                                        select: {name: true}
                                    }
                                }
                            })

                            return {error: `Este pedido já foi feito. Aguarde a confirmação de ${farmName?.farm.name}`}
                        } catch (error) {
                            return {error: "Ocorreu um erro ao verificar informações"}
                        }

                    }
                    
                    //Pegar o endereço do usuário
                    const consumerAdress = await prisma.users.findFirst({
                        where: {id: userId},
                        select: {adress: true}
                    })

                    //Validar endereço de entrega caso usuário adicionou
                    const isValidAdress = delivery ? await getAltLong(delivery!) : null

                    if(isValidAdress && isValidAdress.error){
                        return {error: isValidAdress.error}
                    }

                    const state = isValidAdress ? isValidAdress.state?.split(" ")[0] as Province ?? "" : ""
                    
                    if(state != "Bengo" && state != "Luanda" && delivery){
                        return {error: "Endereço de entrega inválido"}
                    }

                    try {
                        const orderRow = await prisma.orders.create({
                            data: {
                                consumerId: consumerId.id,
                                farmId: farmIdRow?.id!,
                                productId: productRow.id,
                                qtd: qtd,
                                unit: unit,
                                value: price,
                                delivery: delivery ? isValidAdress!.adress! : consumerAdress!.adress,
                                status: "inactive"
                            }
                        })

                        const { transportValue, registagroValue, total } = paymentSplit(price)

                        try {
                            const { error, reference } = await paymentModel.create(orderRow.id, transportValue, productRow.price, registagroValue, price, total)

                            if(error){
                                return {error: error}
                            }

                            return {reference: reference}
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

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!farmRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const ordersRow = await prisma.orders.findMany({
                    where: {
                        farmId: farmRow.id,
                        AND: [
                            {status: {not: "inactive"}},
                            {status: {not: "deleted"}}
                        ]
                    }
                })

                const totalOrders = await prisma.orders.count({
                    where: {farmId: farmRow.id,}
                })

                const totalPendentsOrders = await prisma.orders.count({
                    where: {
                        farmId: farmRow.id,
                        status: "pendent"
                    }
                })

                const totalOngoingOrders = await prisma.orders.count({
                    where: {
                        farmId: farmRow.id,
                        status: "ongoing"
                    }
                })

                const totalIncollectionOrders = await prisma.orders.count({
                    where: {
                        farmId: farmRow.id,
                        status: "incollection"
                    }
                })

                const totalDeliveredOrders = await prisma.orders.count({
                    where: {
                        farmId: farmRow.id,
                        status: "delivered"
                    }
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

                        const transportRequest = await prisma.transport_requests.findFirst({
                            where: {orderId: column.id},
                            select: {status: true}
                        })

                        const transportRow = await prisma.transport_requests.findFirst({
                            where: {
                                orderId: column.id,
                                OR: [
                                    {status: "aguardando_coleta"},
                                    {status: "entregue"},
                                    {status: "em_transporte"}
                                ]
                            },
                            select: {
                                carrier: {
                                    select: {
                                        carrier: {
                                            select: {
                                                name: true,
                                                phone: true,
                                                adress: true,
                                                province: true
                                            }
                                        }
                                    }
                                },
                                start_at: true,
                                delivered_at: true,
                                vehicle: {
                                    select: {
                                        brand: true,
                                        plate: true,
                                    }
                                }
                            }
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
                                where: {id: userId},
                                select: {
                                    name: true,
                                    profile: true
                                }
                            }),
                            transport: transportRow ? {
                                carrier: transportRow.carrier.carrier.name,
                                phone: transportRow.carrier.carrier.phone,
                                province: transportRow.carrier.carrier.province,
                                adress: transportRow.carrier.carrier.adress,
                                brand: transportRow.vehicle.brand,
                                plate: transportRow.vehicle.plate,
                                start_at: transportRow.start_at,
                                delivered_at: transportRow.delivered_at
                            } : null,
                            product: await prisma.products.findFirst({
                                where: {id: column.productId},
                                select: {
                                    name: true,
                                    photo: true, 
                                    type: true,
                                    transport: true,
                                    price: true
                                }
                            }),
                            qtd: column.qtd,
                            unit: column.unit,
                            value: column.value,
                            status: column.status,
                            created_at: column.created_at,
                            transport_status: `${column.status != "pendent" ? transportRequest?.status : null}`,
                            delivery_adress: column.delivery
                        }
                    })
                )

                return {
                    orders: orders,
                    total: totalOrders,
                    pendents: totalPendentsOrders,
                    ongoing: totalOngoingOrders,
                    incollection: totalIncollectionOrders,
                    delivered: totalDeliveredOrders
                }
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

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!farmRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const isValidOrder = await prisma.orders.findFirst({
                    where: {
                        farmId: farmRow.id,
                        id: orderId,
                        status: {not: "inactive"}
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

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!farmRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const isValidOrder = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        farmId: farmRow.id,
                        status: {not: "inactive"}
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

    async sentOrders(userId: string){
        try {
            const consumerRow = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!consumerRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const ordersRow = await prisma.orders.findMany({
                    where: {
                        consumerId: consumerRow.id,
                        status: {not: "inactive"}
                    }
                })

                if(ordersRow.length == 0){
                    return {info: "Você ainda não fez nenhum pedido"}
                }

                const orders = await Promise.all(
                    ordersRow.map(async column =>{
                        const farmRow = await prisma.farms.findFirst({
                            where: {id: column.farmId},
                            select: {farmId: true}
                        })

                        return {
                            id: column.id,
                            farm: await prisma.users.findFirst({
                                where: {id: farmRow?.farmId!},
                                select: {
                                    name: true,
                                    profile: true,
                                    farms: {select: {nif: true}}
                                }
                            }),
                            product: await prisma.products.findFirst({
                                where: {id: column.productId},
                                select: {
                                    name: true,
                                    photo: true,
                                    type: true
                                }
                            }),
                            qtd: column.qtd,
                            unit: column.unit,
                            total: `${column.value}Kz`,
                            status: column.status,
                            created_at: column.created_at
                        }
                    })
                )

                return {orders: orders}
            } catch (error) {
                return {error: "Não foi possível carregar seus pedidos"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }

    async cancelOrder(userId: string, orderId: string){
        try {
            const consumerRow = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!consumerRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const cancelResult = await paymentModel.cancelPayment(orderId)

                if(cancelResult.error){
                    return {error: cancelResult.error}
                }

                try {
                    const isValidOrder = await prisma.orders.findFirst({
                        where: {
                            id: orderId,
                            consumerId: consumerRow.id,
                            OR: [
                                {status: "pendent"},
                                {status: "confirmed"}
                            ]
                        }
                    })

                    if(!isValidOrder){
                        return {error: "Não é possível cancelar pedido"}
                    }

                    try {
                        await prisma.orders.update({
                           where: {
                               id: orderId,
                               consumerId: consumerRow.id,
                           },
                           data: {status: "canceled"}
                       })
        
                       return {message: "Pedido e pagamento cancelados com sucesso"}
                    } catch (error) {
                       return {error: "Não foi possível cancelar pedido"}
                    }
                } catch (error) {
                    return {error: "Ocorreu um erro inesperado"}
                }

            } catch (error) {
                return {error: error}
            }

        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }

    async updateOrder(userId: string, orderId: string, qtd: number, unit: Stock){
        try {
            const consumerRow = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!consumerRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const isValidOrder = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        consumerId: consumerRow.id,
                        status: "pendent"
                    },
                    select: {productId: true}
                })

                if(!isValidOrder){
                    return {error: "Já não é possível atualizar pedido"}
                }

                try {
                    const productRow = await prisma.products.findFirst({
                        where: {
                            id: isValidOrder.productId,
                            status: "active"
                        },
                        select: {
                            stock: true,
                            unit: true,
                            price: true
                        }
                    })

                    const isValidStock = verifyStock(qtd, unit, productRow?.stock!, productRow?.unit!)

                    if(!isValidStock){
                        return {error: "Não foi possível atualizar produto, estoque insuficiente"}
                    }

                    const price = orderPrice(productRow?.price!, qtd, unit)

                    try {
                        await prisma.orders.update({
                            where: {
                                id: orderId,
                                consumerId: consumerRow.id
                            },
                            data: {
                                qtd: qtd,
                                unit: unit,
                                value: price
                            }
                        })
    
                        return {message: "Pedido atualizado com sucesso"}
                    } catch (error) {
                        return {error: "Não foi possível editar pedido"}
                    }
                } catch (error) {
                    return {error: "Ocorreu um erro inesperado"}
                }
            } catch (error) {
                return {error: "Não foi possível verificar pedido"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }

    async deleteOrder(userId: string, orderId: string){
        try {
            const consumerRow = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!consumerRow || !userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const orderRow = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        consumerId: consumerRow.id,
                        status: {in: ["rejected", "canceled"]}
                    }
                })

                if(!orderRow){
                    return {error: "Não é possível apagar este pedido"}
                }

                try {
                    await prisma.orders.update({
                        where: {
                            id: orderId,
                            consumerId: consumerRow.id,
                            status: {not: "deleted"}
                        },
                        data: {status: "deleted"}
                    })

                    return {message: "Pedido apagado com sucesso"}
                } catch (error) {
                    return {error: "Ocorreu um erro ao apagar pedido"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar pedido"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }
}
