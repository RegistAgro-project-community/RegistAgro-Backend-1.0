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
                where: {
                    orderId: orderId,
                    vehicleId: vehicleId,
                }
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
                            }
                        }
                    })

                    const request = await prisma.transport_requests.create({
                        data: {
                            orderId: orderId,
                            vehicleId: vehicleId
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
}
