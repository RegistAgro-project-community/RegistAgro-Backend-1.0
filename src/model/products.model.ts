import path from "node:path";
import type { ProductsType, Rule, Stock, VehiclesType } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { notFound } from "../errors/notFound";
import type { UploadedFile } from 'express-fileupload';
import { image } from "../utils/image";

export class ProductsModel {
    async create(userId: string, name: string, description: string, price: number, stock: number, unit: Stock, type: ProductsType, transport: VehiclesType){
        try {
            const farmId = await prisma.farms.findFirst({
                where: {
                    farmId: userId
                },
                select: {id: true}
            })

            if(!farmId){
                return {info: "Informações inválidas"}
            }

            try {
                const isRegistered = await prisma.products.findFirst({
                    where: {
                        AND: [
                            {name: {
                                contains: name,
                                mode: "insensitive"
                            }},
                            {farmId: farmId.id},
                            {status: "active"}
                        ]
                    }
                })

                if(isRegistered){
                    return {info: "Este produto já foi cadastrado"}
                }
                try {
                    await prisma.products.create({
                        data: {
                            name: name,
                            description: description,
                            price: price,
                            stock: stock,
                            unit: unit,
                            type: type,
                            photo: "",
                            transport: transport,
                            farmId: farmId.id
                        }
                    })

                    return {message: "Produto cadastrado com sucesso"}
                } catch (error) {
                    return {error: "Ocorreu um erro ao cadastrar produto"}
                }
                
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar produto"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro inesperado"}
        }
    }

    async productPhoto(userId: string, productId: string, img: UploadedFile | undefined){
        const url = path.join(process.cwd(), "src", "upload", "products")
        try {
            const uploadResult = await image(img, url, "product")

            if(!uploadResult.success){
                if(uploadResult.validFormat){
                    return {
                        success: uploadResult.success,
                        error: uploadResult.error,
                        validFormat: uploadResult.validFormat
                    }
                }
                return {
                    success: uploadResult.success,
                    error: uploadResult.error
                }
            }

            try {
                const farmId = await prisma.farms.findFirst({
                    where: {farmId: userId},
                    select: {id: true}
                })

                if(!farmId){
                    return {error: "Informações inválidas"}
                }

                try {
                    const urlImg = `http://localhost:5500/upload/products/${uploadResult.filename}`
    
                    const productRow = await prisma.products.update({
                        where: {
                            id: productId,
                            farmId: farmId.id,
                            status: "active"
                        },
                        data: {photo: urlImg}
                    })
    
                    if(!productRow){
                        return {info: "Produto não encontrado"}
                    }
    
                    return {message: "Foto adicionada com sucesso"}
                } catch (error) {
                    if(notFound(error)){
                        return {info: "Produto não encontrado"}
                    }
                    return {error: "Ocorreu um erro ao salvar imagem"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar informações"}
            }
            
        } catch (error) {
            return {error: "Não foi possível salvar imagem"}
        }

    }

    async update(productId: string, userId: string, name: string, description: string, price: number, stock: number, unit: Stock){
        try {
            const farmId = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true}
            })

            if(!farmId){
                return {error: "Informações inválidas"}
            }

            try {
                const productRow = await prisma.products.update({
                    where: {
                        id: productId,
                        farmId: farmId.id,
                        status: "active"
                    },
                    data: {
                        name: name,
                        description: description,
                        price: price,
                        stock: stock,
                        unit: unit
                    }
                })
    
                if(!productRow){
                    return {info: "Produto não encontrado"}
                }
    
                return {message: "Produto atualizado com sucesso"}
            } catch (error) {
                if(notFound(error)){
                    return {info: "Produto não encontrado"}
                }
    
                return {error: "Não foi possível atualizar produto"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async getAll(userId: string, rule?: Rule){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true, balance: true}
            })

            if(!farmRow){
                return {error: "Informações inválidas"}
            }
            try {
                const totalProdutos = await prisma.products.count({
                    where: {
                        farmId: farmRow.id,
                        status: "active"
                    }
                })

                try {
                    const lowStock = await prisma.products.count({
                        where: {
                            farmId: farmRow.id
                            ,
                            status: "active",
                            stock: {lte: 10},
                            unit: "kg"
                        }
                    })

                    try {
                        const products = await prisma.products.findMany({
                            where: {
                                farmId: farmRow.id,
                                status: "active"
                            },
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                stock: true,
                                unit: true,
                                transport: true,
                                type: true,
                                photo: true,
                                created_at: true
                            }
                        })
            
                        if(products.length == 0){
                            return {info: "Você não ainda não possui nenhum produto"}
                        }

                        if(rule == "consumer"){
                            return {
                                products: products
                            }
                        }

                        return {
                            products: products,
                            totalProducts: totalProdutos,
                            balance: `${farmRow.balance}Kz`,
                            low_stock: lowStock
                        }
                    } catch (error) {
                        return {error: "Não foi possível carregar seus produtos"}
                    }
                } catch (error) {
                    return {error: "Ocorreu um erro inesperado"}
                }

            } catch (error) {
                return {error: "Ocorreu um erro ao carregar informações"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async get(productId: string, userId: string){
        try {
            const farmId = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true}
            })
            
            if(!farmId){
                return {error: "Informações inválida"}
            }

            try {
                const productRow = await prisma.products.findFirst({
                    where: {
                        AND: [
                            {farmId: farmId.id},
                            {id: productId}, 
                            {status: "active"}
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        stock: true,
                        unit: true,
                        transport: true,
                        type: true,
                        photo: true,
                        created_at: true
                    }
                })
    
                if(!productRow){
                    return {info: "Produto não encontrado"}
                }
    
                return {
                    product: productRow, 
                    farmId: farmId.id
                }
            } catch (error) {
                if(notFound(error)){
                    return {info: "Produto não encontrado"}
                }
    
                return {error: "Não foi possível carregar produto"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }

    }

    async delete(userId: string, productId: string){
        try {
            const farmId = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true}
            })

            if(!farmId){
                return {error: "Informações inválida"}
            }

            try {
                const productRow = await prisma.products.update({
                    where: {
                        id: productId,
                        farmId: farmId.id
                    },
                    data: {
                        status: "inactive"
                    }
                })
    
                if(!productRow){
                    return {info: "Produto não encontrado"}
                }
    
                return {message: "Produto apagado com sucesso"}
            } catch (error) {
                if(notFound(error)){
                    return {info: "Produto não encontrado"}
                }
    
                return {error: "Não foi possível apagar produto"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informaçoes"}
        }
    }
}
