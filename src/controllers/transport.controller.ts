import type { Request, Response } from "express";
import { TransportModel } from "../model/transport.model.js";
import type { Stock, VehiclesType } from "../../generated/prisma/enums.js";
import { vehiclesTypeError } from "../errors/vehiclesType.error.js";
import { errors } from "../errors/controllers.errors.js";
import type { UploadedFile } from "express-fileupload";
import { zodError } from "../errors/zod.erros.js";
import { createVehiclesSchema, hireCarrierSchema } from "../utils/schemas/vehicles.schema.js";
import { createCoordenateSchema } from "../utils/schemas/coordinates.zod.js";

const transportModel = new TransportModel()

class TransportController {
    async showCarriers(req: Request, res: Response){
        const userId = req.user!.id
        const transportType = req.params["transport"] ?? ""

        if(vehiclesTypeError(transportType)){
            return res.status(400).json({
                error: `O parametro ${transportType} não é válido`,
                validParameters: ["aberto", "aberto_coberto", "fechado", "frigorifico"]
            })
        }

        try {
            const showCarriersResult = await transportModel.showCarriers(userId, transportType as VehiclesType)

            if(showCarriersResult.error){
                return res.status(400).json(showCarriersResult)
            }
            if(showCarriersResult.info){
                return res.status(404).json(showCarriersResult)
            }

            return res.status(200).json(showCarriersResult)
        } catch (error) {
            return errors(res)
        }
    }

    async createTransport(req: Request, res: Response){
        const userId = req.user!.id
        const photo = req.files?.photo as UploadedFile | undefined

        if(!req.body["data"]){
            return res.status(400).json({error: "O campo data não foi enviado"})
        }

        const jsonData = JSON.parse(req.body["data"])

        try {
            const { brand, plate, category, capacity, unit } = createVehiclesSchema.parse(jsonData)

            try {
                const createResult = await transportModel.createTransport(userId, brand, plate, category as VehiclesType, capacity, unit as Stock, photo)

                if(createResult.info){
                    return res.status(409).json(createResult)
                }else if(createResult.error){
                    return res.status(400).json(createResult)
                }

                return res.status(201).json(createResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async hireCarrier(req: Request, res: Response){
        const userId = req.user!.id
        
        try {
            const { orderId, vehicleId } = hireCarrierSchema.parse(req.body)

            try {
                const hireResult = await transportModel.hireCarrier(userId, orderId, vehicleId)

                if(hireResult.error){
                    return res.status(400).json(hireResult)
                }else if(hireResult.info){
                    return res.status(404).json(hireResult)
                }else if(hireResult.warning){
                    return res.status(409).json(hireResult)
                }

                return res.status(201).json(hireResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async myVehicles(req: Request, res: Response){
        const userId = req.user!.id

        try {
            const vehiclesResult = await transportModel.myVehicles(userId)

            if(vehiclesResult.error){
                return res.status(400).json(vehiclesResult)
            }else if(vehiclesResult.info){
                return res.status(404).json(vehiclesResult)
            }

            return res.status(200).json(vehiclesResult)
        } catch (error) {
            return errors(res)
        }
    }

    async getRequest(req: Request, res: Response){
        const userId = req.user!.id

        try {
            const requestsResult = await transportModel.getRequests(userId)

            if(requestsResult.error){
                return res.status(400).json(requestsResult)
            }else if(requestsResult.info){
                return res.status(404).json(requestsResult)
            }

            return res.status(200).json(requestsResult)
        } catch (error) {
            return errors(res)
        }
    }

    async acceptRequest(req: Request, res: Response){
        const userId = req.user!.id

        try {
            const { requestId, latitude, longitude } = createCoordenateSchema.parse(req.body)

            try {
                const acceptResult = await transportModel.acceptRequest(userId, requestId, latitude, longitude)
    
                if(acceptResult.info){
                    return res.status(404).json(acceptResult)
                }else if(acceptResult.error){
                    return res.status(400).json(acceptResult)
                }
    
                return res.status(200).json(acceptResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }
}

export default new TransportController()
