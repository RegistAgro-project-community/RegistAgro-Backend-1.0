import { Router, type Request, type Response } from "express";
import authController from "../controllers/auth/auth.controller";

const router = Router()

//Auth
router.post('/auth/signup/:rule', authController.signup)
router.get('/auth/signup/verify/:code', authController.verifyCode)
router.get('/auth/signup/nif/:nif', authController.verifyNif)

export { router }
