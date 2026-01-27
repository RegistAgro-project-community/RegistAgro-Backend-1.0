import { Router, type Request, type Response } from "express";
import authController from "../controllers/auth/auth.controller";
import { auth } from "../middlewares/auth";
import { authorization } from "../middlewares/permissions";
import productsController from "../controllers/products.controller";

const router = Router()

//Auth
router.post('/auth/signup/:rule', authController.signup)
router.get('/auth/signup/verify/:code', authController.verifyCode)
router.get('/auth/signup/nif/:nif', authController.verifyNif)
router.post('/auth/farm/signup', auth, authorization("farm", "create"), authController.createFarmPass)
router.get('/auth/farm/login', authController.farmSignIn)
router.get('/auth/login', authController.login)

//Products
router.post('/products/create', auth, authorization("farm", "create"), productsController.create)
router.post('/products/upload/:id', auth, authorization("farm", "create"), productsController.productPhoto)
router.put('/products/update/:id', auth, authorization("farm", "update"), productsController.update)
router.get('/products/farms/getAll', auth, authorization("farm", "read"), productsController.getAll)
router.get('/products/farms/get/:id', auth, authorization("farm", "read"), productsController.get)
router.delete('/products/delete/:id', auth, authorization("farm", "delete"), productsController.delete)

export { router }
