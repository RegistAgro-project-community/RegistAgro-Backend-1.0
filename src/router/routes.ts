import { Router, type Request, type Response } from "express";
import authController from "../controllers/auth/auth.controller";
import { auth } from "../middlewares/auth";
import { authorization } from "../middlewares/permissions";

const router = Router()

//Auth
router.post('/auth/signup/:rule', authController.signup)
router.get('/auth/signup/verify/:code', authController.verifyCode)
router.get('/auth/signup/nif/:nif', authController.verifyNif)
router.post('/auth/farm/signup', auth, authorization("farm", "create"), authController.createFarmPass)
router.get('/auth/farm/login', authController.farmSignIn)
router.get('/auth/login', authController.login)

export { router }
