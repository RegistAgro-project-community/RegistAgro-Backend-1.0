import type { Request, Response } from "express";
import { zodError } from "../errors/zod.erros.js";
import { createCoordenateSchema } from "../utils/schemas/coordinates.zod.js";
import { errors } from "../errors/controllers.errors.js";
import { LocationModel } from "../model/location.model.js";

const locationModel = new LocationModel()

class LocationController {
    async updateLocation(req: Request, res: Response){
        const userId = req.user!.id

        try {
            const { requestId, latitude, longitude } = createCoordenateSchema.parse(req.body)

            try {
                const updateResult = await locationModel.updateLocation(userId, requestId, latitude, longitude)

                if(updateResult.error){
                    return res.status(400).json(updateResult)
                }else if(updateResult.info){
                    return res.status(404).json(updateResult)
                }

                return res.status(200).json(updateResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async getDirection(req: Request, res: Response){
        const userId = req.user!.id
        const requestId = req.params["id"] as string

        try {
            const getResult = await locationModel.getDirection(userId, requestId)

            if(getResult.error){
                return res.status(400).json(getResult)
            }else if(getResult.info){
                return res.status(404).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            return errors(res)
        }
    }

    async getLocation(req: Request, res: Response){
        const userId = req.user!.id
        const orderId = req.params["id"] as string

        try {
            const getResult = await locationModel.getLocation(userId, orderId)

            if(getResult.error){
                return res.status(400).json(getResult)
            }else if(getResult.info){
                return res.status(404).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            return errors(res)
        }
    }
}

export default new LocationController()
