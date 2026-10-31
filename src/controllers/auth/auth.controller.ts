import type { Request, Response } from "express";
import { zodError } from "../../errors/zod.erros.js";
import { signupSchema } from "../../utils/schemas/schema.zod.js";
import { ruleValidation } from "../../errors/rule.errros.js";
import { AuthModel } from "../../model/auth/auth.model.js";
import { errors } from "../../errors/controllers.errors.js";
import type { Province, Rule } from "../../../generated/prisma/enums.js";
import { farmSigninSchema, loginSchema, refreshTokenSchema, verifyOtpSchema } from "../../utils/schemas/login.zod.js";
import type { CaptchaValidator } from "../../services/captcha-validator.js";
import { TurnstileValidator } from "../../services/turnstile-validator.js";
import { captchaHeaderSchema } from "../../utils/schemas/authorization.zod.js";

const authModel = new AuthModel()

export class AuthController {
    constructor(private readonly captchaValidator: CaptchaValidator = new TurnstileValidator()) {
        this.signup = this.signup.bind(this)
        this.verifyNif = this.verifyNif.bind(this)
        this.createFarmPass = this.createFarmPass.bind(this)
        this.login = this.login.bind(this)
        this.farmSignIn = this.farmSignIn.bind(this)
    }
    async signup(req: Request, res: Response){
        const rule = req.params.rule
        
        if(ruleValidation(rule!, res)){
            return res.status(400).json({
                message: `Parametro {${rule}} invalido`,
                validParameteres: ["consumer", "carrier"]
            })
        }

        try {
            const { name, email, phone, adress, province, pass1, pass2, captchaToken } = signupSchema.parse(req.body)
            if (!(await this.captchaValidator.validate(captchaToken, req.ip))) return res.status(400).json({error: "Verificação de segurança inválida"})

            try {
                const signupResult = await authModel.signup(name, email, phone, rule as Rule, adress, province as Province, pass1, pass2)

                if(!signupResult.valid){
                    return res.status(400).json(signupResult)
                }

                return res.status(201).json(signupResult)

            } catch (error) {
                return errors(res, error)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async verifyCode(req: Request, res: Response){
        try {
            const input = req.method === "GET"
                ? verifyOtpSchema.parse({ email: req.query.email, code: req.params.code })
                : verifyOtpSchema.parse(req.body)
            const verifyResult = await authModel.verifyCode(input.email, input.code)

            if(!verifyResult.valid || !verifyResult.tokens){
                return res.status(400).json(verifyResult)
            }else if(verifyResult.data){
                res.set("authorization", `Bearer ${verifyResult.tokens.accessToken}`)
                
                return res.status(202).json({message: verifyResult.message, data: verifyResult.data, ...verifyResult.tokens})
            }
            
            res.set("authorization", `Bearer ${verifyResult.tokens.accessToken}`)

            return res.status(202).json({message: verifyResult.message, ...verifyResult.tokens})
        } catch (error) {
            return zodError(error, res)
        }
    }

    async verifyNif(req: Request, res: Response){
        const nif = req.params.nif
        const captchaHeader = captchaHeaderSchema.safeParse({ "x-captcha-token": req.get("x-captcha-token") });
        if (!captchaHeader.success || !(await this.captchaValidator.validate(captchaHeader.data["x-captcha-token"], req.ip))) {
            return res.status(400).json({error: "Verificação de segurança inválida"})
        }
        
        try {
            const nifResult = await authModel.verifyNif(nif as string)

            if(!nifResult.valid){
                return res.status(400).json(nifResult)
            }

            return res.status(200).json(nifResult)
        } catch (error) {
            return errors(res)
        }
    }

    async createFarmPass(req: Request, res: Response){
        const farmId = req.user?.id

        try {
            const { name, email, phone, adress, province, pass1, pass2, captchaToken } = signupSchema.parse(req.body)
            if (!(await this.captchaValidator.validate(captchaToken, req.ip))) return res.status(400).json({error: "Verificação de segurança inválida"})

            try {
                const passResult = await authModel.createFarmPass(farmId!, name, email, phone, province as Province, adress, pass1, pass2)

                if(!passResult.valid){
                    return res.status(400).json(passResult)
                }

                return res.status(201).json(passResult)
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async login(req: Request, res: Response){
        const rule = req.params["rule"]

        if(ruleValidation(rule!, res, ["consumer", "carrier", "admin"])){
            return res.status(400).json({
                error: `Parametro {${rule}} invalido`,
                validParameteres: ["consumer", "carrier", "admin"]
            })
        }

        try {
            const { email, password, captchaToken } = loginSchema.parse(req.body)
            if (!(await this.captchaValidator.validate(captchaToken, req.ip))) return res.status(400).json({error: "Credenciais inválidas"})

            try {
                const loginResult = await authModel.login(email, password, rule as Rule)

                if(!loginResult.valid || !loginResult.tokens){
                    return res.status(401).json({error: "Credenciais inválidas"})
                }

                res.set("authorization", `Bearer ${loginResult.tokens.accessToken}`)

                return res.status(200).json({message: loginResult.message, ...loginResult.tokens})
            } catch (error) {
                return errors(res, error)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async farmSignIn(req: Request, res: Response){
        try {
            const { nif, password, captchaToken } = farmSigninSchema.parse(req.body)
            if (!(await this.captchaValidator.validate(captchaToken, req.ip))) return res.status(400).json({error: "Credenciais inválidas"})

            try {
                const signInResult = await authModel.farmSignIn(nif, password)

                if(!signInResult.valid || !signInResult.tokens){
                    return res.status(401).json({error: "Credenciais inválidas"})
                }

                res.set("authorization", `Bearer ${signInResult.tokens.accessToken}`)

                return res.status(200).json({message: signInResult.message, ...signInResult.tokens})
            } catch (error) {
                return errors(res)
            }
        } catch (error) {
            return zodError(error, res)
        }
    }

    async verifyToken(req: Request, res: Response){
        return res.status(200).json({message: "Token verificado com sucesso"})
    }

    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = refreshTokenSchema.parse(req.body)
            const tokens = await authModel.refreshTokens(refreshToken)
            if (!tokens) return res.status(401).json({ error: "Sessão inválida ou expirada" })
            res.set("authorization", `Bearer ${tokens.accessToken}`)
            return res.status(200).json(tokens)
        } catch (error) {
            return zodError(error, res)
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = refreshTokenSchema.parse(req.body)
            await authModel.revokeRefreshToken(refreshToken)
            return res.status(204).end()
        } catch (error) {
            return zodError(error, res)
        }
    }
}

export default new AuthController()
