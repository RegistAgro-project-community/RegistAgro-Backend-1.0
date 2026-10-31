import type { Province, Rule } from "../../../generated/prisma/enums.js"
import { prisma } from "../../../lib/prisma.js"
import { sendEmailWithOTP, verifyOTPCode } from "../../services/email.service.js"
import { authTokenService } from "../../services/auth-token.store.js"
import type { AuthTokenService } from "../../services/auth-token.service.js"
import { AbstractApiEmailValidator, type EmailDeliverabilityValidator } from "../../services/email-deliverability.js"
import { GeoapifyGeocoder, type Geocoder } from "../../services/geocoder.js"
import { PasswordHash } from "../../utils/password.hash.js"
import type { PasswordHasher } from "../../utils/password-hasher.js"
import { verifyAndUpgradePassword } from "../../services/authenticate-password.js"

class AuthModel {
    constructor(
        private readonly passwordHasher: PasswordHasher = new PasswordHash(),
        private readonly emailValidator: EmailDeliverabilityValidator = new AbstractApiEmailValidator(),
        private readonly geocoder: Geocoder = new GeoapifyGeocoder(),
        private readonly tokenService: AuthTokenService = authTokenService,
    ) {}
    async signup(name: string, email: string, phone: string, rule: Rule, adress: string, province: Province, pass1: string, pass2: string){
        if(!(await this.emailValidator.isDeliverable(email))){
            return {
                valid: false,
                message: "Email inválido"
            }
        }

        const isValidAdress = await this.geocoder.geocode(adress)
        
        if(isValidAdress.error){
            return {error: isValidAdress.error}
        }

        const state = isValidAdress.state?.split(" ")[0] ?? ""

        if(province != state){
            return {error: "O seu endereço não pertence a sua província"}
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
                const passHash = await this.passwordHasher.hash(pass1)

                try {
                    await prisma.users.upsert({
                        where: {email: email},
                        create: {
                            name: name,
                            email: email,
                            phone: phone,
                            rule: rule,
                            adress: adress,
                            province: province,
                            password: passHash,
                            profile: "",
                            status: "pendent"
                        },
                        update: {
                            name: name,
                            phone: phone,
                            rule: rule,
                            adress: adress,
                            province: province,
                            password: passHash,
                            status: "pendent"
                        }
                    })

                    //Enviar email de verificação
                    const { valid, error } = await sendEmailWithOTP(email)

                    if(valid){
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
                        //Enviar email de verificação
                        const { valid, error } = await sendEmailWithOTP(isValidNif.email)
                        
                        if(valid){
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

    async verifyCode(email: string, code: string){
        const { valid, error } = await verifyOTPCode(email, code)

        if(valid){
            try {
                const userData = await prisma.users.findFirst({
                    where: { email, status: "pendent" }
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
                            await prisma.users.update({ where: { id: userData.id }, data: { status: "active" } })
                            const tokens = await this.tokenService.issue(userData.id, userData.rule)

                            return {
                                valid: true,
                                message: "Código verificado com sucesso",
                                tokens,
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

                const tokens = await this.tokenService.issue(userData.id, userData.rule)

                return {
                    valid: true,
                    message: "Conta verificada com sucesso",
                    tokens
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
        if(!(await this.emailValidator.isDeliverable(email))){
            return {
                valid: false,
                message: "Email inválido"
            }
        }

        const isValidAdress = await this.geocoder.geocode(adress)
        
        if(isValidAdress.error){
            return {error: isValidAdress.error}
        }

        const state = isValidAdress.state?.split(" ")[0] ?? ""

        if(province != state){
            return {error: "O seu endereço não pertence a sua província"}
        }

        try {
            const hash = await this.passwordHasher.hash(pass1)
            
            try {
                const farmRow = await prisma.users.update({
                    where: {id: farmId},
                    data: {
                        name: name,
                        phone: phone,
                        province: province,
                        adress: adress,
                        status: "active",
                        password: hash
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

    async login(email: string, pass: string, rule: Rule){
        try {
            const userData = await prisma.users.findUnique({
                where: {
                    email: email,
                    status: "active",
                    rule: rule
                }
            })

            if(userData){
                const verifyPass = await verifyAndUpgradePassword(this.passwordHasher, userData.password, pass, async password => {
                    await prisma.users.update({where: {id: userData.id}, data: {password}})
                })

                if(verifyPass){
                    const tokens = await this.tokenService.issue(userData.id, userData.rule)

                    return {
                        valid: true,
                        message: "Login efetuado com sucesso",
                        tokens
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
                where: {
                    farms: {
                        some: {nif: nif}
                    },
                    status: "active"
                }
            })

            if(userData){
                const verifyPass = await verifyAndUpgradePassword(this.passwordHasher, userData.password, pass, async password => {
                    await prisma.users.update({where: {id: userData.id}, data: {password}})
                })

                if(verifyPass){
                    const tokens = await this.tokenService.issue(userData.id, userData.rule)

                    return {
                        valid: true,
                        message: "Login efetuado com sucesso",
                        tokens
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

    refreshTokens(refreshToken: string) {
        return this.tokenService.rotate(refreshToken)
    }

    revokeRefreshToken(refreshToken: string) {
        return this.tokenService.revoke(refreshToken)
    }
}

export { AuthModel }
