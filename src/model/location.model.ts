import { prisma } from "../../lib/prisma.js"
import { getAdress, getAltLong } from "../services/location.service.js"

export class LocationModel {
    async updateLocation(userId: string, requestId: string, latitude: string, longitude: string){
        try {
            const carrierRow = await prisma.carriers.findFirst({
                where: {
                    carrier: {
                        id: userId,
                        status: "active"
                    }
                }
            })

            if(!carrierRow){
                return {error: "Informações inválidas"}
            }

           try {
                const isValidRequest = await prisma.transport_requests.findFirst({
                    where: {
                        id: requestId, 
                        carrierId: carrierRow.id,
                        status: "aguardando_coleta"
                    },
                    select: {
                        id: true,
                        orderId: true
                    }
                })

                if(!isValidRequest){
                    return {info: "Pedido não encontrado ou inválido"}
                }

                const isValidCoordinate = await getAdress(latitude, longitude)
                
                if(isValidCoordinate.error || !isValidCoordinate.sucess){
                    return {error: isValidCoordinate.error ?? "Coordenadas inválidas"}
                }

                try {
                    const update_at = new Date()

                    await prisma.location.updateMany({
                        where: {
                            carrierId: carrierRow.id,
                            orderId: isValidRequest.orderId,
                            active: true
                        },
                        data: {
                            update_at: update_at,
                            latitude: latitude,
                            longitude
                        }
                    })

                    return {ok: true}
                } catch (error) {
                    return {error: "Não foi possível atualizar localização"}
                }
           } catch (error) {
                return {error: "Não foi possível verificar solicitação"}
           }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async getDirection(userId: string, requestId: string){
        try {
            const carrierRow = await prisma.carriers.findFirst({
                where: {
                    carrier: {
                        id: userId,
                        status: "active"
                    }
                }
            })

            if(!carrierRow){
                return {error: "Informações inválidas"}
            }

            try {
                const isValidRequest = await prisma.transport_requests.findFirst({
                    where: {
                        id: requestId, 
                        carrierId: carrierRow.id,
                        OR: [
                            {status: "aguardando_coleta"},
                            {status: "em_transporte"}
                        ]
                    },
                    select: {
                        id: true,
                        orderId: true,
                        status: true,
                        order: {
                            select: {
                                farm: {
                                    select: {
                                        farm: {
                                            select: {
                                                province: true,
                                                adress: true
                                            }
                                        }
                                    }
                                },
                                consumer: {
                                    select: {
                                        consumer: {
                                            select: {
                                                adress: true,
                                                province: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                if(!isValidRequest){
                    return {info: "Pedido não encontrado ou inválido"}
                }

                if(isValidRequest.status == "aguardando_coleta"){
                    try {
                        const farmAdress = isValidRequest.order.farm.farm.adress
    
                        const farmCoordinates = await getAltLong(farmAdress)
    
                        if(farmCoordinates.error){
                            return {error: farmCoordinates.error}
                        }
    
                        const userCoordinates = await prisma.location.findFirst({
                            where: {
                                carrierId: carrierRow.id,
                                orderId: isValidRequest.orderId,
                                active: true
                            }
                        })
    
                        return {
                            destination: [
                                farmCoordinates.latitude,
                                farmCoordinates.longitude
                            ],
                            origin: [
                                userCoordinates?.latitude,
                                userCoordinates?.longitude
                            ],
                            start_at: userCoordinates?.time,
                            update_at: userCoordinates?.update_at
                        }
                    } catch (error) {
                        return {error: "Não foi possível carregar coordenadas"}
                    }

                }

                try {
                    const consumerAdress = isValidRequest.order.consumer.consumer.adress

                    const consumerCoordinates = await getAltLong(consumerAdress)
    
                    if(consumerCoordinates.error){
                        return {error: consumerCoordinates.error}
                    }

                    const userCoordinates = await prisma.location.findFirst({
                        where: {
                            carrierId: carrierRow.id,
                            orderId: isValidRequest.orderId,
                            active: true
                        }
                    })

                    return {
                        destination: [
                            consumerCoordinates.latitude,
                            consumerCoordinates.longitude
                        ],
                        origin: [
                            userCoordinates?.latitude,
                            userCoordinates?.longitude
                        ],
                        start_at: userCoordinates?.time,
                        update_at: userCoordinates?.update_at
                    }
                } catch (error) {
                    return {error: "Não foi possível carregar coordenadas"}
                }

            } catch (error) {
                return {error: "Não foi possível verificar solicitação"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async getLocation(userId: string, orderId: string){
        try {
            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const orderRow = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        OR: [
                            {status: "delivered"},
                            {status: "incollection"},
                            {status: "ongoing"}
                        ]
                    },
                    select: {
                        status: true,
                        farm: {
                            select: {
                                farm: {
                                    select: {
                                        province: true,
                                        adress: true
                                    }
                                }
                            }
                        },
                        consumer: {
                            select: {
                                consumer: {
                                    select: {
                                        adress: true,
                                        province: true
                                    }
                                }
                            }
                        }
                    }
                })

                if(!orderRow){
                    return {info: "Pedido não encontrado ou inválido"}
                }

                if(orderRow.status == "incollection"){
                    try {
                        const farmAdress = orderRow.farm.farm.adress

                        const farmCoordinates = await getAltLong(farmAdress)

                        if(farmCoordinates.error){
                            return {errror: farmCoordinates.error}
                        }

                        const coordinates = await prisma.location.findFirst({
                            where: {
                                orderId: orderId,
                                active: true
                            }
                        })
                        
                        return {
                            destination: [
                                farmCoordinates.latitude,
                                farmCoordinates.longitude
                            ],
                            origin: [
                                coordinates?.latitude,
                                coordinates?.longitude
                            ],
                            start_at: coordinates?.time,
                            update_at: coordinates?.update_at
                        }
                    } catch (error) {
                        return {error: "Ocorreu um erro ao carregar coordenadas"}
                    }
                }

                try {
                    const consumerAdress = orderRow.consumer.consumer.adress

                    const consumerCoordinates = await getAltLong(consumerAdress)

                    if(consumerCoordinates.error){
                        return {error: consumerCoordinates.error}
                    }

                    const carrierCoordinates = await prisma.location.findFirst({
                        where: {
                            orderId: orderId,
                            active: true
                        }
                    })

                    return {
                        destination: [
                            consumerCoordinates.latitude,
                            consumerCoordinates.longitude
                        ],
                        origin: [
                            carrierCoordinates?.latitude,
                            carrierCoordinates?.longitude
                        ],
                        start_at: carrierCoordinates?.time,
                        update_at: carrierCoordinates?.update_at
                    }
                } catch (error) {
                    return {error: "Não foi possível carregar coordenadas"}
                }
            } catch (error) {
                return {error: "Não foi possível verificar pedido"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }
}
