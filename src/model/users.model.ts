import type { UploadedFile } from "express-fileupload";
import type { Province } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../errors/notFound.js";
import path from "path";
import { image } from "../utils/image.js";

export class UsersModel {
    async update(userId: string, name: string, adress: string, province: Province){
        try {
            const userRow = await prisma.users.update({
                where: {
                    id: userId,
                    status: "active"
                },
                data: {
                    name: name,
                    adress: adress,
                    province: province
                }
            })

            if(!userRow){
                return {error: "Não foi possível atualizar seus dados"}
            }

            return {message: "Dados atualizado com sucesso"}
        } catch (error) {
            if(notFound(error)){
                return {info: "Usuário não encontrado"}
            }

            return {error: "Não foi possível atualizar seus dados"}
        }
    }

    async delete(userId: string){
        try {
            const userRow = await prisma.users.update({
                where: {
                    id: userId,
                    status: "active"
                },
                data: {status: "inactive"}
            })

            if(!userRow){
                return {error: "Não foi possível apagar sua conta"}
            }

            return {message: "Sua conta foi apagada com sucesso"}
        } catch (error) {
            if(notFound(error)){
                return {info: "Usuário não encontrado"}
            }

            return {error: "Não foi possível apagar conta"}
        }
    }

    async profilePhoto(userId: string, img: UploadedFile | undefined){
        const url = path.join(process.cwd(), "src", "upload", "users")

        try {
            const uploadResult = await image(img, url, "user")

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

            try {
                const profileUrl = `http://localhost:5500/upload/users/${uploadResult.filename}`

                const userRow = await prisma.users.update({
                    where: {
                        id: userId,
                        status: "active",
                    },
                    data: {
                        profile: profileUrl
                    }
                })

                if(!userRow){
                    return {error: "Informações inválidas"}
                }

                return {message: "Foto de perfil atualizada com sucesso"}
            } catch (error) {
                if(notFound(error)){
                    return {info: "Usuário não encontrado"}
                }

                return {error: "Ocorreu um erro ao salvar imagem"}
            }
        } catch (error) {
            return {error: "Não foi possível salvar foto"}
        }
    }

    async profile(userId: string){
        try {
            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                },
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    province: true,
                    adress: true,
                    created_at: true,
                    profile: true,
                    rule: true
                }
            })

            if(!userRow){
                return {error: "Informações inválidas"}
            }

            switch (userRow.rule) {
                case "carrier":
                    try {
                        const carrierId = await prisma.carriers.findFirst({
                            where: {carrierId: userId}
                        })

                        if(!carrierId){
                            return {error: "Informações inválidas"}
                        }

                        return {
                            message: "Dados carregado com sucesso",
                            data: userRow,
                            id: carrierId.id
                        }
                    } catch (error) {
                        return {error: "Ocorreu um erro inesperado"}
                    }
                    break;
                
                case "consumer":
                    try {
                        const consumerId = await prisma.consumers.findFirst({
                            where: {consumerId: userId}
                        })

                        if(!consumerId){
                            return {error: "Informações inválidas"}
                        }

                        return {
                            message: "Dados carregado com sucesso",
                            data: userRow,
                            id: consumerId.id
                        }
                    } catch (error) {
                        return {error: "Ocorreu um erro inesperado"}
                    }
                    break
                default:
                    try {
                        const farmId = await prisma.farms.findFirst({
                            where: {farmId: userId}
                        })

                        if(!farmId){
                            return {error: "Informações inválidas"}
                        }

                        return {
                            message: "Dados carregado com sucesso",
                            data: userRow,
                            id: farmId.id
                        }
                    } catch (error) {
                        return {error: "Ocorreu um erro inesperado"}
                    }
                    break;
            }
        } catch (error) {
            if(notFound(error)){
                return {info: "Usuário não encontrado"}
            }

            return {error: "Não foi possível carregar seus dados"}
        }
    }
}
