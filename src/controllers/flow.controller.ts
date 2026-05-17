import type { Request, Response } from "express";
import { errors } from "../errors/controllers.errors.js";
import { FlowModel } from "../model/flow.model.js";

const flowModel = new FlowModel()

class FlowController {
    async  startFlow(req: Request, res: Response){
        const userId = req.user!.id
        const orderId = req.params["id"] as string

        try {
            const startResult = await flowModel.startFlow(userId, orderId)

            if(startResult.error){
                return res.status(400).json(startResult)
            }else if(startResult.info){
                return res.status(404).json(startResult)
            }

            return res.status(200).json(startResult)
        } catch (error) {
            return errors(res)
        }
    }

    async finishFlow(req: Request, res: Response){
        const userId = req.user!.id
        const requestId = req.params["id"] as string

        try {
            const finishResult = await flowModel.finishFlow(userId, requestId)

            if(finishResult.error){
                return res.status(400).json(finishResult)
            }else if(finishResult.info){
                return res.status(404).json(finishResult)
            }

            return res.status(200).json(finishResult)
        } catch (error) {
            return errors(res)
        }
    }

    async completeOrder(req: Request, res: Response){
        const userId = req.user!.id
        const orderId = req.params["id"] as string

        try {
            const completeResult = await flowModel.completeOrder(userId, orderId)

            if(completeResult.error){
                return res.status(400).json(completeResult)
            }else if(completeResult.info){
                return res.status(404).json(completeResult)
            }

            return res.status(200).json(completeResult)
        } catch (error) {
           return errors(res) 
        }
    }
}

export default new FlowController()
