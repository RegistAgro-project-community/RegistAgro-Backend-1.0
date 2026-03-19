import path from "node:path";
import type { ProductsType, Rule, Stock, VehiclesType } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../errors/notFound.js";
import type { UploadedFile } from 'express-fileupload';
import { image } from "../utils/image.js";
import 'dotenv/config.js'

export class ProductsModel {
    async create(img: UploadedFile | undefined,userId: string, name: string, description: string, price: number, stock: number, unit: Stock, type: ProductsType, transport: VehiclesType){
        try {
            const farmId = await prisma.farms.findFirst({
                where: {
                    farmId: userId,
                    farm: {
                        status: "active"
                    }
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

                const url = process.env.ENV == 'dev' ? path.join(process.cwd(), "src", "upload", "products") : 'upload/products'

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

                    const imgEnv = process.env.ENV! == 'dev' ? "http://localhost:5500" : "https://api-registagro.onrender.com"

                    const urlImg = `${imgEnv}/upload/products/${uploadResult.filename}`

                    try {

                        await prisma.products.create({
                            data: {
                                name: name,
                                description: description,
                                price: price,
                                stock: stock,
                                unit: unit,
                                type: type,
                                photo: process.env.ENV == 'dev' ? urlImg : uploadResult.filename!,
                                transport: transport,
                                farmId: farmId.id
                            }
                        })
    
                        return {message: "Produto cadastrado com sucesso"}
                    } catch (error) {
                        return {error: "Ocorreu um erro ao cadastrar produto"}
                    }
                } catch (error) {
                    return{error: "Não foi possível cadastrar produto"}
                }
                
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar produto"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro inesperado"}
        }
    }

    async productPhoto(userId: string, productId: string, img: UploadedFile | undefined){
        const url = process.env.ENV == 'dev' ? path.join(process.cwd(), "src", "upload", "products") : "upload/products"

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
                    where: {
                        farmId: userId,
                        farm: {status: "active"}
                    },
                    select: {id: true}
                })

                if(!farmId){
                    return {error: "Informações inválidas"}
                }

                const api = process.env.ENV == "dev" ? "http://localhost:5500" : "https://api-registagro.onrender.com"

                const urlImg = `${api}/upload/products/${uploadResult.filename}`

                try {
                    const productRow = await prisma.products.update({
                        where: {
                            id: productId,
                            farmId: farmId.id,
                            status: "active"
                        },
                        data: {
                            photo: process.env.ENV == 'dev' ? urlImg : uploadResult.filename!
                        }
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

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!farmId || !userRow){
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

    async getAll(userId: string){
        try {
            const farmRow = await prisma.farms.findFirst({
                where: {farmId: userId},
                select: {id: true, balance: true, farmId: true}
            })

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!farmRow ||!userRow){
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
                        var products = await prisma.products.findMany({
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

                        const farmProducts = products.map(key => {
                            return {
                                id: key.id,
                                name: key.name,
                                description: key.description,
                                price: `${key.price}Kz/kg`,
                                qtd: `${key.stock}${key.unit == 't' ? 'ton' : key.unit}`,
                                transport: `Caminhão ${key.transport}`,
                                type: key.type,
                                photo: key.photo,
                                created_at: key.created_at
                            }
                        })

                        return {
                            products: farmProducts,
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

    async farmerProducts(userId: string, farmId: string){
        try {
            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            const farmProducts = await prisma.farms.findFirst({
                where: {
                    farm: {
                        id: farmId,
                        status: "active"
                    }
                },
                select: {
                    farm: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            profile: true,
                            province: true,
                            adress: true
                        } 
                    },
                    products: {
                        where: {status: "active"},
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            price: true,
                            stock: true,
                            unit: true,
                            transport: true,
                            photo: true,
                            type: true
                        }
                    },
                    nif: true
                }
            })

            if(!userRow || !farmProducts){
                return {error: "Informações inválidas"}
            }

            if(farmProducts.products.length == 0){
                return {info: "Esta fazenda não possui nenhum produto"}
            }

            const farmRow = {
                farm: farmProducts.farm,
                products: farmProducts.products.map(key =>{
                    return {
                        id: key.id,
                        name: key.name,
                        description: key.description,
                        price: `${key.price}Kz/kg`,
                        stock: key.stock,
                        unit: key.unit == "t" ? "ton" : key.unit,
                        transport: `Caminhão ${key.transport}`,
                        photo: key.photo,
                        type: key.type
                    }
                }),
                nif: farmProducts.nif
            }

            return {
                message: "Dados carregados com sucesso",
                data: farmRow
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

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })
            
            if(!farmId || !userRow){
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
                    product: productRow
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

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!farmId || !userRow){
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

    async consumerGet(productId: string, userId: string){
        try {
            const userRow = await prisma.consumers.findFirst({
                where: {
                    consumer: {
                        id: userId,
                        status: "active"
                    }
                }
            })
    
            if(!userRow){
                return {error: "Informações inválidas"}
            }

            try {
                const productRow = await prisma.products.findFirst({
                    where: {
                        AND: [
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
                        created_at: true,
                        farmId: true
                    }
                })
    
                if(!productRow){
                    return {info: "Produto não encontrado"}
                }

                const farmProfile = await prisma.farms.findFirst({
                    where: {id: productRow.farmId},
                    select: {
                        farm: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                profile: true,
                                province: true,
                                adress: true
                            }
                        },
                        nif: true
                    }
                })

                const farm = {
                    id: farmProfile?.farm.id,
                    name: farmProfile?.farm.name,
                    email: farmProfile?.farm.email,
                    phone: farmProfile?.farm.phone,
                    profile: farmProfile?.farm.profile,
                    province: farmProfile?.farm.province,
                    adress: farmProfile?.farm.adress
                }

                const product = {
                    name: productRow.name,
                    description: productRow.description,
                    price: `${productRow.price}Kz/kg`,
                    stock: productRow.stock,
                    unit: productRow.unit == "t" ? "ton" : productRow.unit,
                    transport: `Caminhão ${productRow.transport}`,
                    type: productRow.type,
                    photo: productRow.photo,
                    created_at: productRow.created_at
                }
    
                return {
                    message: "Produto carregado com sucesso",
                    farm: farm,
                    product: product,
                    nif: farmProfile?.nif
                }
            } catch (error) {
                if(notFound(error)){
                    return {info: "Produto não encontrado"}
                }
    
                return {error: "Não foi possível carregar produto"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar infomações"}
        }
        
    }

    async consumerGetAll(userId: string){
        try {
            const consumerId = await prisma.consumers.findFirst({
                where: {consumerId: userId},
                select: {id: true}
            })

            const userRow = await prisma.users.findFirst({
                where: {
                    id: userId,
                    status: "active"
                }
            })

            if(!consumerId || !userRow){
                return {info: "Informações inválida"}
            }

            try {
                const farmsAndProducts = await prisma.farms.findMany({
                    where: {farm: {status: "active"}},
                    select: {
                        farm: {
                            select: {
                                id: true,
                                name: true,
                                profile: true,
                            }
                        },
                        products: {
                            where: {status: "active"},
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                photo: true,
                                price: true,
                                type: true,
                                stock: true,
                                unit: true,
                                transport: true
                            }
                        }
                    }
                })

                const products = farmsAndProducts.filter(key => key.products.length > 0).map(key =>({
                    farm: key.farm,
                    products: key.products.map(key =>{
                        return {
                            id: key.id,
                            name: key.name,
                            description: key.description,
                            photo: key.photo,
                            price: `${key.price}Kz/kg`,
                            type: key.type,
                            qtd: `${key.stock}`,
                            unit: key.unit == 't' ? 'ton' : key.unit,
                            transport: `Caminhão ${key.transport}`
                        }
                    })
                }))

                if(products.length == 0){
                    return {info: "Ainda não existe produtos na RegistAgro"}
                }

                return {data: products}
            } catch (error) {
                return {error: "Ocorreu um erro ao carregar produtos"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar informações"}
        }
    }
}
