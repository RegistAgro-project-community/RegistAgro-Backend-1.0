import type { Request, Response } from "express";
import { Payments } from "../services/payment.service.js";
import { zodError } from "../errors/zod.erros.js";
import { confirmPaymentSchema } from "../utils/schemas/confirmPayment.zod.js";
import { errors } from "../errors/controllers.errors.js";

const paymentService = new Payments()

class ConfirmPayment {
    async confirm(req: Request, res: Response){
        const userId = req.user?.id

        try {
            const { reference } = confirmPaymentSchema.parse(req.body)

            try {
                const confirmPaymentResult = await paymentService.confirmPayment(userId!, reference)

                if(confirmPaymentResult.error){
                    return res.status(400).json(confirmPaymentResult)
                }

                return res.status(200).json(confirmPaymentResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }
}

export default new ConfirmPayment()
