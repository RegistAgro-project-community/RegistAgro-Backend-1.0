import type { Request, Response } from "express"
import { ProductsModel } from "../model/products.model.js"
import { zodError } from "../errors/zod.erros.js"
import { createSchema, updateSchema } from "../utils/schemas/products.zod.js"
import { errors } from "../errors/controllers.errors.js"
import type { ProductsType, Rule, Stock, VehiclesType } from "../../generated/prisma/enums.js"
import type { UploadedFile } from "express-fileupload"

const productModel = new ProductsModel()

class ProductController {
    async create(req: Request, res: Response){
        const farmId = req.user?.id
        const img = req.files?.img as UploadedFile | undefined
        
        if(!req.body['data']){
            return res.status(400).json({error: "O campo data não foi enviado"})
        }

        const parseData = JSON.parse(req.body['data'])
        
        try {
            const { name, description, price, stock, unit, type, transport } = createSchema.parse(parseData)

            try {
                const createResult = await productModel.create(img, farmId!, name, description, price, stock, unit as Stock, type as ProductsType, transport as VehiclesType)

                if(createResult.info || createResult.error){
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

    async productPhoto(req: Request, res: Response){
        const farmId = req.user?.id
        const productId = req.params.id
        const img = req.files?.img as UploadedFile | undefined
        try {
            const productPhotoResult = await productModel.productPhoto(farmId!, productId as string, img)

            if(productPhotoResult.info){
                return res.status(404).json(productPhotoResult)
            }else if(productPhotoResult.message){
                return res.status(200).json(productPhotoResult)
            }

            return res.status(400).json(productPhotoResult)

        } catch (error) {
            errors(res)
        }
    }

    async update(req: Request, res: Response){
        const farmId = req.user?.id
        const productId = req.params.id

        try {
            const { name, description, price, stock, unit } = updateSchema.parse(req.body)

            try {
                const updateResult = await productModel.update(productId as string, farmId!, name, description, price, stock, unit as Stock)

                if(updateResult.info){
                    return res.status(404).json(updateResult)
                }
                if(updateResult.error){
                    return res.status(400).json(updateResult)
                }

                return res.status(200).json(updateResult)
            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }

    async getAll(req: Request, res: Response){
        const farmId = req.user?.id

        try {
            const getResult = await productModel.getAll(farmId!)

            if(getResult.info){
                return res.status(404).json(getResult)
            }
            if(getResult.error){
                return res.status(400).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            errors(res)
        }
    }

    async get(req: Request, res: Response){
        const productId = req.params.id
        const farmId = req.user?.id

        try {
            const getResult = await productModel.get(productId as string, farmId!)

            if(getResult.info){
                return res.status(404).json(getResult)
            }
            if(getResult.error){
                return res.status(400).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            errors(res)
        }
    }

    async delete(req: Request, res: Response){
        const farmId = req.user?.id
        const productId = req.params.id

        try {
            const deleteResult = await productModel.delete(farmId!, productId as string)

            if(deleteResult.info){
                return res.status(404).json(deleteResult)
            }
            if(deleteResult.error){
                return res.status(400).json(deleteResult)
            }

            return res.status(200).json(deleteResult)
        } catch (error) {
            errors(res)
        }
    }

    async consumerReadAll(req: Request, res: Response){
        const farmId = req.params.id
        const rule = req.user?.rule
        
        try {
            const getResult = await productModel.getAll(farmId as string, rule as Rule)

            if(getResult.info){
                return res.status(404).json(getResult)
            }
            if(getResult.error){
                return res.status(400).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            errors(res)
        }
    }

    async consumerRead(req: Request, res: Response){
        const productId = req.params['id']

        if(!productId) {
            return res.status(400).json({ error: "Parâmetro inválidos" })
        }

        try {
            const getResult = await productModel.consumerGet(productId as string)

            if(getResult.info){
                return res.status(404).json(getResult)
            }
            if(getResult.error){
                return res.status(400).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            errors(res)
        }
    }

    async consumerGetAll(req: Request, res: Response){
        const userId = req.user?.id

        try {
            const getResult = await productModel.consumerGetAll(userId!)

            if(getResult.info){
                return res.status(404).json(getResult)
            }else if(getResult.error){
                return res.status(400).json(getResult)
            }

            return res.status(200).json(getResult)
        } catch (error) {
            errors(res)
        }
    }
}

export default new ProductController()
