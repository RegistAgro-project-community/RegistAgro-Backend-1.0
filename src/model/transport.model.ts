import type { UploadedFile } from "express-fileupload";
import type { Stock, VehiclesType } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import 'dotenv/config.js'
import path from "node:path";
import { image } from "../utils/image.js";
import { verifyStock } from "../utils/verifyStock.js";

export class TransportModel {
    async showCarriers(userId: string, transport: VehiclesType){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {
                    farm: {
                        id: userId,
                        status: "active"
                    }
                },
                select: {farm: true}
            })
    
            if(!farmRow){
                return {error: "Informações inválidas"}
            }
            
            try {
                const vehiclesRow = await prisma.carriers.findMany({
                    where: {
                        carrier: {
                            status: "active",
                            province: farmRow.farm.province
                        }
                    },
                    select: {
                        carrier: {
                            select: {
                                id: true,
                                name: true,
                                profile: true,
                                phone: true
                            }
                        },
                        busy: true,
                        vehicles: {
                            where: {
                                type: transport,
                                status: "active"
                            },
                            select: {
                                id: true,
                                brand: true,
                                plate: true,
                                type: true,
                                capacity: true,
                                unit: true,
                                photo: true
                            }
                        }
                    }
                })

                if(vehiclesRow.length == 0){
                    return {info: "Não existem transportes perto da sua localização"}
                }

                const vehicles = vehiclesRow.filter(key => key.vehicles.length > 0).map(key => ({
                   carrier: key.carrier,
                   vehicles: key.vehicles.map(key =>{
                    return {
                        id: key.id,
                        brand: key.brand,
                        plate: key.plate,
                        type: `Caminhão ${key.type}`,
                        capacity: `${key.capacity}${key.unit == "t" ? "ton" : key.unit}`,
                        photo: key.photo
                    }
                   })
                }))

                return {vehicles: vehicles}
            } catch (error) {
                return {error: "Ocorreu um erro ao carregar transportes"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }

    }

    async createTransport(userId: string, brand: string, plate: string, type: VehiclesType, capacity: number, unit: Stock, photo: UploadedFile | undefined){
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
                const isValidPlate = await prisma.vehicles.findFirst({
                    where: {plate: plate}
                })

                if(isValidPlate){
                    return {info: "Este veículo já foi cadastrado"}
                }

                const isRegistered = await prisma.vehicles.findFirst({
                    where: {
                        AND: [
                            {
                                brand: {
                                    contains: brand,
                                    mode: "insensitive"
                                }
                            },
                            {plate: plate},
                            {carrierId: carrierRow.id},
                            {status: "active"}
                        ]
                    }
                })

                if(isRegistered){
                    return {info: "Você já cadastrou este veículo"}
                }

                const url = process.env.ENV == 'dev' ? path.join(process.cwd(), "src", "upload", "vehicles") : "upload/vehicles"

                try {
                    const uploadResult = await image(photo, url, "vehicle")

                    if(!uploadResult.success){
                        if(uploadResult.validFormat){
                            return {
                                sucess: uploadResult.success,
                                error: uploadResult.error,
                                validFormat: uploadResult.validFormat
                            }
                        }

                        return {
                            sucess: uploadResult.success,
                            error: uploadResult.error
                        }
                    }

                    const imgEnv = process.env.ENV! == 'dev' ? "http://localhost:5500" : "https://api-registagro.onrender.com"

                    const urlImg = `${imgEnv}/upload/vehicles/${uploadResult.filename}`

                    try {
                        await prisma.vehicles.create({
                            data: {
                                carrierId: carrierRow.id,
                                brand: brand,
                                plate: plate,
                                type: type,
                                capacity: capacity,
                                unit: unit,
                                photo: process.env.ENV == "dev" ? urlImg : uploadResult.filename!
                            }
                        })

                        return {message: "Veículo cadastrado com sucesso"}
                    } catch (error) {
                        return {error: "Não foi possível cadastrar veículo"}
                    }
                } catch (error) {
                    return {error: "Ocorreu um erro ao cadastrar veículo"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar veículo"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }

    async hireCarrier(userId: string, orderId: string, vehicleId: string){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {
                    farm: {
                        id: userId,
                        status: "active"
                    }
                }
            })

            if(!farmRow){
                return {error: "Informações inválidas"}
            }

            const requestRow = await prisma.transport_requests.findFirst({
                where: {orderId: orderId}
            })

            if(requestRow){
                switch (requestRow.status) {
                    case "pendente":
                        return {warning: "Esta solicitação já foi feita. Aguarde pela confirmação da transportadora"}

                    case "aceite":
                        return {warning: "A sua solicitação já foi aceite. Aguarde pelo início da entrega."}

                    case "em_transporte":
                        return {warning: "A sua solicitação já está em andamento. Aguarde pela finalização da entrega"}

                    case "entregue":
                        return {warning: "A sua solicitação já foi entregue. Confirme o seu pagamento ou aguarde pela confirmação do consumidor"}

                    default:
                        return {warning: "O sua solicitação foi rejeitada pela transportadora. Solicite outro transporte"}
                        break;
                }

            }

            try {
                const orderRow = await prisma.orders.findFirst({
                    where: {
                        id: orderId,
                        farmId: farmRow.id,
                        status: "confirmed"
                    }
                })

                const vehicleRow = await prisma.vehicles.findFirst({
                    where: {
                        id: vehicleId,
                        status: "active"
                    }
                })

                if(!orderRow || !vehicleRow){
                    return {info: "Estes dados são inválidos"}
                }

                const veRifyCapacity = verifyStock(orderRow.qtd, orderRow.unit, vehicleRow.capacity, vehicleRow.unit)

                if(!veRifyCapacity){
                    return {error: "Este veículo não tem capacidade para transportar este pedido"}
                }

                try {
                    const carrierRow = await prisma.carriers.findFirst({
                        where: {
                            id: vehicleRow.carrierId,
                            carrier: {status: "active"}
                        },
                        select: {
                            id: true,
                            carrier: {
                                select: {
                                    name: true,
                                    phone: true,
                                    province: true,
                                    adress: true
                                }
                            },
                            busy: true
                        }
                    })

                    if(carrierRow?.busy){
                        return {error: "Não é possível contratar este veículo. A transportadora encontra-se em outra viagem"}
                    }

                    const request = await prisma.transport_requests.create({
                        data: {
                            orderId: orderId,
                            vehicleId: vehicleId,
                            carrierId: vehicleRow.carrierId
                        }
                    })

                    return {
                        order_id: orderRow.id,
                        status: request.status,
                        hiredCarrier: {
                            carrier_id: carrierRow?.id,
                            name: carrierRow?.carrier.name,
                            phone: carrierRow?.carrier.phone,
                            province: carrierRow?.carrier.province,
                            adress: carrierRow?.carrier.adress,
                            busy: carrierRow?.busy,
                            vehicle_id: vehicleRow.id,
                            brand: vehicleRow.brand,
                            plate: vehicleRow.plate,
                        },
                        message: "Solicitação de transporte feito com sucesso. Aguarde pela confirmação da transportadora."
                    }
                } catch (error) {
                    return {error: "Não foi possível solicitar transporte"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro inesperado"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"} 
        }
    }

    async myVehicles(userId: string){
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
                const vehicleRow = await prisma.vehicles.findMany({
                    where: {
                        carrierId: carrierRow.id,
                        status: "active"
                    },
                    select: {
                        id: true,
                        brand: true,
                        plate: true,
                        type: true,
                        capacity: true,
                        unit: true,
                        photo: true
                    }
                })

                if(vehicleRow.length == 0){
                    return {info: "Você ainda não possui nenhum veículo"}
                }

                return {
                    message: "Veículos carregados com sucesso",
                    vehicles: vehicleRow.map(key =>{
                        return {
                            id: key.id,
                            brand: key.brand,
                            plate: key.plate,
                            type: key.type,
                            capacity: `${key.capacity}${key.unit == "t" ? "ton" : key.unit}`,
                            photo: key.photo
                        }
                    })
                }
            } catch (error) {
                return {error: "Não foi possível carregar seus veículos"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async getRequests(userId: string){
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
                const requestsRow = await prisma.transport_requests.findMany({
                    where: {carrierId: carrierRow.id}
                })

                if(requestsRow.length == 0){
                    return {info: "Você não possui nehuma solicitação de transporte"}
                }

                try {
                    const requests = await Promise.all(
                        requestsRow.map(async column =>{
                            const orderInfo = await prisma.orders.findFirst({
                                where: {
                                    id: column.orderId,
                                    status: "confirmed"
                                },
                                select: {
                                    id: true,
                                    farm: {
                                        select: {
                                            farm: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    phone: true,
                                                    profile: true,
                                                    province: true,
                                                    adress: true
                                                }
                                            }
                                        }
                                    },
                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                            price: true,
                                            photo: true,
                                        }
                                    },
                                    qtd: true,
                                    unit: true,
                                    value: true
                                }
                            })

                            const vehicleInfo = await prisma.vehicles.findFirst({
                                where: {
                                    id: column.vehicleId,
                                    status: "active"
                                },
                                select: {
                                    id: true,
                                    brand: true,
                                    plate: true,
                                    capacity: true,
                                    unit: true,
                                    type: true,
                                    photo: true
                                }
                            })

                            return {
                                farm: {
                                    id: orderInfo?.farm.farm.id,
                                    name: orderInfo?.farm.farm.name,
                                    phone: orderInfo?.farm.farm.phone,
                                    province: orderInfo?.farm.farm.province,
                                    adress: orderInfo?.farm.farm.adress,
                                    profile: orderInfo?.farm.farm.profile
                                },
                                order: {
                                    product_id: orderInfo?.product.id,
                                    productName: orderInfo?.product.name,
                                    price: `${orderInfo?.product.price}Kz`,
                                    photo: orderInfo?.product.photo,
                                    qtd: `${orderInfo?.qtd}${orderInfo?.unit == "t" ? "ton" : "kg"}`,
                                    value: `${orderInfo?.value}Kz`
                                },
                                vehicle: {
                                    id: vehicleInfo?.id,
                                    brand: vehicleInfo?.brand,
                                    plate: vehicleInfo?.plate,
                                    type: vehicleInfo?.type,
                                    capacity: `${vehicleInfo?.capacity}${vehicleInfo?.unit == "t" ? "ton" : vehicleInfo?.unit}`,
                                    photo: vehicleInfo?.photo
                                }
                            }
                        })
                    )

                    return {
                        message: "Solicitações carregadas com sucesso",
                        requests: requests
                    }
                } catch (error) {
                    return {error: "Não foi possível buscar os dados das suas solicitações"}
                }
            } catch (error) {
                return {error: "Não foi possível carregar as solicitações de transporte"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }
}
