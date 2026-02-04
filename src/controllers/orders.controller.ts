import type { Request, Response } from "express";
import { zodError } from "../errors/zod.erros";
import { createOrderSchema } from "../utils/schemas/orders.zod";
import { errors } from "../errors/controllers.errors";
import { OrdersModel } from "../model/orders.model";
import type { Stock } from "../../generated/prisma/enums";

const ordersModel = new OrdersModel()

class OrdersController {
    async create(req: Request, res: Response){
        const userId = req.user?.id
        const farmId = req.params["id"]

        try {
            const { name, value, qtd, unit } = createOrderSchema.parse(req.body)

            try {
                const createResult = await ordersModel.create(userId!, farmId as string, name, value, qtd, unit as Stock)

                if(createResult.info){
                    return res.status(404).json(createResult)
                }else if(createResult.error){
                    return res.status(400).json(createResult)
                }

                return res.status(201).json(createResult)
            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }

    async viewsAll(req: Request, res: Response){
        const userId = req.user?.id
        
        try {
            const getAllResult = await ordersModel.viewsAll(userId!)

            if(getAllResult.error){
                return res.status(400).json(getAllResult)
            }else if(getAllResult.info){
                return res.status(404).json(getAllResult)
            }

            return res.status(200).json(getAllResult)
        } catch (error) {
            errors(res)
        }
    }

    async accept(req: Request, res: Response){
        const userId = req.user?.id
        const orderId = req.params["id"]
        
        try {
            const acceptResult = await ordersModel.accept(userId!, orderId as string)

            if(acceptResult.error){
                return res.status(400).json(acceptResult)
            }else if(acceptResult.info){
                return res.status(404).json(acceptResult)
            }

            return res.status(200).json(acceptResult)
        } catch (error) {
            errors(res)
        }
    }

    async reject(req: Request, res: Response){
        const userId = req.user?.id
        const orderId = req.params["id"]
        
        try {
            const rejectResult = await ordersModel.reject(userId!, orderId as string)

            if(rejectResult.error){
                return res.status(400).json(rejectResult)
            }else if(rejectResult.info){
                return res.status(404).json(rejectResult)
            }

            return res.status(200).json(rejectResult)
        } catch (error) {
            errors(res)
        }
    }
}

export default new OrdersController()
