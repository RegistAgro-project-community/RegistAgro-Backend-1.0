import type { Request, Response } from "express";
import { zodError } from "../errors/zod.erros";
import { updateUser } from "../utils/schemas/users.zod";
import { errors } from "../errors/controllers.errors";
import { UsersModel } from "../model/users.model";
import type { Province } from "../../generated/prisma/enums";
import type { UploadedFile } from "express-fileupload";

const usersModel = new UsersModel()

class UsersController {
    async update(req: Request, res: Response){
        const userId = req.user?.id

        try {
            const { name, adress, province } = updateUser.parse(req.body)

            try {
                const updateResult = await usersModel.update(userId!, name, adress, province as Province)

                if(updateResult.error){
                    return res.status(400).json(updateResult)
                }else if(updateResult.info){
                    return res.status(404).json(updateResult)
                }

                return res.status(200).json(updateResult)
            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }

    async delete(req: Request, res: Response){
        const userId = req.user?.id

        try {
            const deleteResult = await usersModel.delete
            (userId!)
            
            if(deleteResult.error){
                return res.status(400).json(deleteResult)
            }else if(deleteResult.info){
                return res.status(404).json(deleteResult)
            }

            return res.status(200).json(deleteResult)
        } catch (error) {
            errors(res)
        }
    }

    async profilePhoto(req: Request, res: Response){
        const userId = req.user?.id
        const img = req.files?.img as UploadedFile | undefined

        try {
            const profileResult = await usersModel.profilePhoto(userId!, img)

            if(profileResult.info){
                return res.status(404).json(profileResult)
            }else if(profileResult.message){
                return res.status(201).json(profileResult)
            }

            return res.status(400).json(profileResult)
        } catch (error) {
            errors(res)
        }
    }

    async profile(req: Request, res: Response){
        const userId = req.user?.id

        try {
            const dataResult = await usersModel.profile(userId!)

            if(dataResult.error){
                return res.status(400).json(dataResult)
            }else if(dataResult.info){
                return res.status(404).json(dataResult)
            }

            return res.status(200).json(dataResult)
        } catch (error) {
            errors(res)
        }
    }
}

export default new UsersController()
