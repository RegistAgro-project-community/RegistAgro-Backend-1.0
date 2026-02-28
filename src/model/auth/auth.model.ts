import type { Province, Rule } from "../../../generated/prisma/enums.js"
import { prisma } from "../../../lib/prisma.js"
import { redisClient } from "../../config/redis.config.js"
import { sendEmailWithOTP, verifyOTPCode } from "../../services/email.service.js"
import { DataValidate } from "../../utils/data.validate.js"
import { PasswordHash } from "../../utils/password.hash.js"
import jwt from 'jsonwebtoken'

class AuthModel {
    async signup(name: string, email: string, phone: string, rule: Rule, adress: string, province: Province, pass1: string, pass2: string){
        const validData = new DataValidate()

        const validNumber = validData.phoneNumber(phone)
        const validName = validData.name(name)
        const validEmail = validData.email(email)
        const isValidPassword = validData.password(pass1)

        if(!validName){
            return {
                valid: false,
                message: "Nome muito curto"
            }
        }

        if(pass2 != pass1){
            return {
                valid: false,
                message: "Credencias inválidas"
            }
        }

        if(!isValidPassword.valid){
            return {
                valid: isValidPassword.valid,
                error: isValidPassword.error,
                strong: isValidPassword.strong
            }
        }
        if(!validNumber){
            return {
                valid: false,
                message: "Número de telefone inválido"
            }  

        }
        if(!validEmail){ 
            return {
                valid: false,
                message: "Email inválido"
            }
        }

        try {
            const isRegistered = await prisma.users.findFirst({
                where: {
                    OR: [
                        {email: email},
                        {phone: phone}
                    ],
                    status: "active"
                }
            })

            if(isRegistered){
                return {
                    valid: false,
                    message: "Estes dados já foram cadastrados"
                }

            }

            try {
                const hashClass = new PasswordHash()
                const passHash = await hashClass.generate(pass1)

                try {
                    const pendingUserId = await prisma.users.upsert({
                        where: {email: email},
                        create: {
                            name: name,
                            email: email,
                            phone: phone,
                            rule: rule,
                            adress: adress,
                            province: province,
                            password: String(passHash),
                            profile: "",
                            status: "pendent"
                        },
                        update: {
                            name: name,
                            phone: phone,
                            rule: rule,
                            adress: adress,
                            province: province,
                            password: String(passHash),
                            status: "pendent"
                        }
                    })

                    //Armazenar o id do usuário pendente
                    await redisClient.set("pendingUserId", pendingUserId.id)

                    //Gerar código de verificação
                    //const generate = new VerificationCode()
                    //const code = generate.generate()

                    //Enviar email de verificação
                    const { valid, error } = await sendEmailWithOTP(email)

                    if(valid){
                        await redisClient.set("email", email)
                        
                        return {
                            valid: valid,
                            message: "Foi enviado um código de verificação no seu email"
                        }
                    }

                    return {
                        valid: false,
                        message: error
                    }

                } catch (error) {
                    return {error: "Ocorreu um erro inesperado"}
                }
            } catch (error) {
                return {error: "Não foi possível definir dados"}
            }

        } catch (error) {
            return {error: "Ocorreu um erro ao validar dados"}
        }
    }

    async verifyNif(nif: string){
        try {
            //Verificar se o NIF existe
            const isValidNif = await prisma.company.findFirst({
                where: {nif: nif}
            })

            if(!isValidNif){
                return {
                    error: "NIF inválido"
                }
            }

            try {
                //Verificar se o NIF já está cadastrado
                const isRegistered = await prisma.users.findFirst({
                    where: {
                        farms: {
                            some: {
                                nif: nif
                            }
                        },
                        status: "active"
                    }
                })

                if(isRegistered){
                    return {error: "Este NIF já foi cadastrado, faça login"}
                }

                //Armazenar os dados pendente da fazenda
                try {
                    const pendingUserId = await prisma.users.upsert({
                        where: {email: isValidNif.email},
                        create: {
                            name: isValidNif.name,
                            email: isValidNif.email,
                            phone: String(isValidNif.phone),
                            rule: "farm",
                            adress: isValidNif.location,
                            province: isValidNif.province,
                            password: "",
                            profile: ""
                        },
                        update: {
                            name: isValidNif.name,
                            phone: String(isValidNif.phone),
                            rule: "farm",
                            adress: isValidNif.location,
                            province: isValidNif.province,
                            password: ""
                        }
                    })

                    //Criar fazenda
                    try {
                        await prisma.farms.upsert({
                            where: {nif: nif},
                            create: {
                                nif: nif,
                                farmId: pendingUserId.id
                            },
                            update: {farmId: pendingUserId.id}
                        })

                        //Armazenar o id do usuário pendente
                        await redisClient.set("pendingUserId", pendingUserId.id)

                        //Gerar código de verificação
                        //const generate = new VerificationCode()
                        //const code = generate.generate()

                        //Enviar email de verificação
                        const { valid, error } = await sendEmailWithOTP("eucleniocadete@gmail.com")
                        
                        if(valid){
                            await redisClient.set("email", "eucleniocadete@gmail.com")
                            
                            return {
                                valid: valid,
                                message: "Foi enviado um código de verificação no seu email"
                            }
                        }
                        
                        return {
                            valid: false,
                            message: error
                        }
                        
                    } catch (error) {
                        return {error: "Ocooreu um erro inesperado"}
                    }

                } catch (error) {
                    return {error: "Ocorreu um erro inesperado"}
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao verificar informações"}
            }
        } catch (error) {
            return {error: "Não foi possível verificar NIF"}
        }
    }

    async verifyCode(code: string){
        const email = await redisClient.get("email")

        const { valid, error } = await verifyOTPCode(email!, code)

        if(valid){
            try {
                const pedingUserId = await redisClient.get("pendingUserId")

                const userData = await prisma.users.findFirst({
                    where: {id: String(pedingUserId)}
                })
                
                if(!userData){
                    return {
                        valid: false,
                        message: "Não foi possível validar seus dados"
                    }
                }

                switch (userData.rule) {
                    case "carrier":
                        try {
                            await prisma.users.update({
                                where: {
                                    id: userData.id
                                },
                                data: {
                                    status: "active"
                                }
                            })

                            await prisma.carriers.create({
                                data: {
                                    carrierId: userData.id,
                                }
                            })

                        } catch (error) {
                            return {error: "Ocorreu um erro inesperado"}
                        }
                        break;
                    case "consumer":
                        try {
                            await prisma.users.update({
                                where: {
                                    id: userData.id
                                },
                                data: {
                                    status: "active"
                                }
                            })
                            await prisma.consumers.create({
                                data: {consumerId: userData.id}
                            })

                        } catch (error) {
                            return {error: "Ocorreu um erro inesperado"}
                        }
                        break
                    default:
                        try {
                            //Criar token de acesso
                            const token = jwt.sign(
                                {userId: userData.id, rule: userData.rule},
                                process.env.SECRET_KEY!,
                                {expiresIn: "1d"}
                            )

                            return {
                                valid: true,
                                message: "Código verificado com sucesso",
                                token: token,
                                data: {
                                    id: userData.id,
                                    name: userData.name,
                                    email: userData.email,
                                    phone: userData.phone,
                                    province: userData.province,
                                    adress: userData.adress
                                }
                            }

                        } catch (error) {
                            return {error: "Ocorreu um erro inesperado"}
                        }
                        break
                }

                //Criar token de acesso
                const token = jwt.sign(
                    {userId: userData.id, rule: userData.rule},
                    process.env.SECRET_KEY!,
                    {expiresIn: "1d"}
                )

                return {
                    valid: true,
                    message: "Conta verificada com sucesso",
                    token: token
                }
            } catch (error) {
                return {error: "Não foi possível validar seus dados"}
            }
        }

        return {
            valid: false, 
            error: error
        }
    }

    async createFarmPass(farmId: string,name: string, email: string, phone: string, province: Province, adress: string, pass1: string, pass2: string){
        const validData = new DataValidate()

        const validNumber = validData.phoneNumber(phone)
        const validName = validData.name(name)
        const validEmail = validData.email(email)
        const isValidPassword = validData.password(pass1)

        if(!validName){
            return {
                valid: false,
                message: "Nome muito curto"
            }
        }

        if(pass2 != pass1){
            return {
                valid: false,
                message: "Credencias inválidas"
            }
        }

        if(!isValidPassword.valid){
            return {
                valid: isValidPassword.valid,
                error: isValidPassword.error,
                strong: isValidPassword.strong
            }
        }
        if(!validNumber){
            return {
                valid: false,
                message: "Número de telefone inválido"
            }  

        }
        if(!validEmail){ 
            return {
                valid: false,
                message: "Email inválido"
            }
        }

        try {
            const hashClass = new PasswordHash()
            const hash = await hashClass.generate(pass1)
            
            try {
                const farmRow = await prisma.users.update({
                    where: {id: farmId},
                    data: {
                        name: name,
                        phone: phone,
                        province: province,
                        adress: adress,
                        status: "active",
                        password: String(hash)
                    }
                })

                if(!farmRow){
                    return {
                        valid: false,
                        message: "Não foi possível definir senha"
                    }
                }

                return {
                    valid: true,
                    message: "Senha definida com sucesso"
                }
            } catch (error) {
                return {error: "Ocorreu um erro ao definir senha"}
            }
        } catch (error) {
            return {error: "Ocorreu um erro inesperado"}
        }

    }

    async login(email: string, pass: string){
        try {
            const userData = await prisma.users.findUnique({
                where: {
                    email: email,
                    status: "active",
                    OR: [
                        {rule: "carrier"},
                        {rule: "consumer"}
                    ]
                }
            })

            if(userData){
                const hashClass = new PasswordHash()
                const verifyPass = await hashClass.compare(userData.password, pass)

                if(verifyPass){
                    //Criar token de acesso
                    const token = jwt.sign(
                        {userId: userData.id, rule: userData.rule},
                        process.env.SECRET_KEY!,
                        {expiresIn: "1d"}
                    )

                    return {
                        valid: true,
                        message: "Login efetuado com sucesso",
                        token: token
                    }
                }

            }

            return {
                valid: false,
                error: "Email ou senha inválidos"
            }

        } catch (error) {
            return {error: "Erro ao efetuar login"}
        }
    }

    async farmSignIn(nif: string, pass: string){
        try {
            const userData = await prisma.users.findFirst({
                where: {farms: {some: {nif: nif}}}
            })

            if(userData){
                const hashClass = new PasswordHash()
                const verifyPass = await hashClass.compare(userData.password, pass)

                if(verifyPass){
                    //Criar token de acesso
                    const token = jwt.sign(
                        {userId: userData.id, rule: userData.rule},
                        process.env.SECRET_KEY!,
                        {expiresIn: "1d"}
                    )

                    return {
                        valid: true,
                        message: "Login efetuado com sucesso",
                        token: token
                    }
                }

            }

            return {
                valid: false,
                message: "NIF ou senha inválidos"
            }

        } catch (error) {
            return {error: "Erro ao efetuar login"}
        }
    }
}

export { AuthModel }
