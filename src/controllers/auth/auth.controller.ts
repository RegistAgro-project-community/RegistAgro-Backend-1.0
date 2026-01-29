import type { Request, Response } from "express";
import { zodError } from "../../errors/zod.erros";
import { signupSchema } from "../../utils/schemas/schema.zod";
import { ruleValidation } from "../../errors/rule.errros";
import { AuthModel } from "../../model/auth/auth.model";
import { errors } from "../../errors/controllers.errors";
import type { Province, Rule } from "../../../generated/prisma/enums";
import { farmSigninSchema, loginSchema } from "../../utils/schemas/login.zod";

const authModel = new AuthModel()

class AuthController {
    async signup(req: Request, res: Response){
        const rule = req.params.rule
        
        if(ruleValidation(rule!, res)){
            return res.status(400).json({
                message: `Parametro {${rule}} invalido`,
                validParameteres: ["consumer", "carrier"] 
            })
        }

        try {
            const { name, email, phone, adress, province, pass1, pass2 } = signupSchema.parse(req.body)

            try {
                const signupResult = await authModel.signup(name, email, phone, rule as Rule, adress, province as Province, pass1, pass2)

                if(!signupResult.valid){
                    return res.status(400).json(signupResult)
                }

                return res.status(201).json(signupResult)

            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }

    async verifyCode(req: Request, res: Response){
        const code = req.params.code

        try {
            const verifyResult = await authModel.verifyCode(code as string)

            if(!verifyResult.valid){
                return res.status(400).json(verifyResult)
            }else if(verifyResult.data){
                res.set("authorization", `Bearer ${verifyResult.token}`)
                
                return res.status(202).json({message: verifyResult.message, data: verifyResult.data})
            }
            
            res.set("authorization", `Bearer ${verifyResult.token}`)

            return res.status(202).json({message: verifyResult.message})
        } catch (error) {
            errors(res)
        }
    }

    async verifyNif(req: Request, res: Response){
        const nif = req.params.nif
        
        try {
            const nifResult = await authModel.verifyNif(nif as string)

            if(!nifResult.valid){
                return res.status(400).json(nifResult)
            }

            return res.status(200).json(nifResult)
        } catch (error) {
            errors(res)
        }
    }

    async createFarmPass(req: Request, res: Response){
        const farmId = req.user?.id

        try {
            const { name, email, phone, adress, province, pass1, pass2 } = signupSchema.parse(req.body)

            try {
                const passResult = await authModel.createFarmPass(farmId!, name, email, phone, province as Province, adress, pass1, pass2)

                if(!passResult.valid){
                    return res.status(400).json(passResult)
                }

                return res.status(201).json(passResult)
            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }

    async login(req: Request, res: Response){
        try {
            const { email, password } = loginSchema.parse(req.body)

            try {
                const loginResult = await authModel.login(email, password)

                if(!loginResult.valid){
                    return res.status(400).json(loginResult)
                }

                res.set("authorization", `Bearer ${loginResult.token}`)

                return res.status(200).json({message: loginResult.message})
            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }

    async farmSignIn(req: Request, res: Response){
        try {
            const { nif, password } = farmSigninSchema.parse(req.body)

            try {
                const signInResult = await authModel.farmSignIn(nif, password)

                if(!signInResult.valid){
                    return res.status(400).json(signInResult)
                }

                res.set("authorization", `Bearer ${signInResult.token}`)

                return res.status(200).json({message: signInResult.message})
            } catch (error) {
                errors(res)
            }
        } catch (error) {
            zodError(error, res)
        }
    }
}

export default new AuthController()
