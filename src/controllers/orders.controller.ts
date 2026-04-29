import type { Request, Response } from "express";
import { zodError } from "../errors/zod.erros.js";
import { createOrderSchema, updateOrderSchema } from "../utils/schemas/orders.zod.js";
import { errors } from "../errors/controllers.errors.js";
import { OrdersModel } from "../model/orders.model.js";
import type { Stock } from "../../generated/prisma/enums.js";

const ordersModel = new OrdersModel()

class OrdersController {
    async create(req: Request, res: Response){
        const userId = req.user?.id
        const farmId = req.params["id"]

        try {
            const { name, qtd, unit } = createOrderSchema.parse(req.body)

            const delivery = req.body["delivery"] as string

            try {
                const createResult = await ordersModel.create(userId!, farmId as string, name, qtd, unit as Stock, delivery)

                if(createResult.info){
                    return res.status(404).json(createResult)
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
            return errors(res)
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
            return errors(res)
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
            return errors(res)
        }
    }

    async sentOrders(req: Request, res: Response){
        const userId = req.user?.id

        try {
            const sentOrdersResult = await ordersModel.sentOrders(userId!)

            if(sentOrdersResult.error){
                return res.status(400).json(sentOrdersResult)
            }else if(sentOrdersResult.info){
                return res.status(404).json(sentOrdersResult)
            }

            return res.status(200).json(sentOrdersResult)
        } catch (error) {
            return errors(res)
        }
    }

    async cancelOrder(req: Request, res: Response){
        const userId = req.user?.id
        const orderId = req.params["id"]

        try {
            const cancelResult = await ordersModel.cancelOrder
            (userId!, orderId as string)

            if(cancelResult.error){
                return res.status(400).json(cancelResult)
            }

            return res.status(200).json(cancelResult)
        } catch (error) {
            return errors(res)
        }
    }

    async updateOrder(req: Request, res: Response){
        const userId = req.user?.id
        const orderId = req.params["id"]

        try {
            const { qtd, unit } = updateOrderSchema.parse(req.body)

            try {
                const updateResult = await ordersModel.updateOrder(userId!, orderId as string, qtd, unit as Stock)

                if(updateResult.error){
                    return res.status(400).json(updateResult)
                }

                return res.status(200).json(updateResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async deleteOrder(req: Request, res: Response){
        const userId = req.user?.id
        const orderId = req.params["id"]

        try {
            const deleteResult = await ordersModel.deleteOrder(userId!, orderId as string)

            if(deleteResult.error){
                return res.status(400).json(deleteResult)
            }

            return res.status(200).json(deleteResult)
        } catch (error) {
            return errors(res)
        }
    }
}

export default new OrdersController()
