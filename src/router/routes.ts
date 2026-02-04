import { Router, type Request, type Response } from "express";
import authController from "../controllers/auth/auth.controller";
import { auth } from "../middlewares/auth";
import { authorization } from "../middlewares/permissions";
import productsController from "../controllers/products.controller";
import usersController from "../controllers/users.controller";
import ordersController from "../controllers/orders.controller";

const router = Router()

//Auth
router.post('/auth/signup/:rule', authController.signup)
router.get('/auth/signup/verify/:code', authController.verifyCode)
router.get('/auth/signup/nif/:nif', authController.verifyNif)
router.post('/auth/farm/signup', auth, authorization("farm", "create"), authController.createFarmPass)
router.post('/auth/farm/login', authController.farmSignIn)
router.post('/auth/login', authController.login)

//Products
router.post('/products/create', auth, authorization("farm", "create"), productsController.create)
router.post('/products/upload/:id', auth, authorization("farm", "create"), productsController.productPhoto)
router.put('/products/update/:id', auth, authorization("farm", "update"), productsController.update)
router.get('/products/farms/getAll', auth, authorization("farm", "read"), productsController.getAll)
router.get('/products/farms/get/:id', auth, authorization("farm", "read"), productsController.get)
router.delete('/products/delete/:id', auth, authorization("farm", "delete"), productsController.delete)
router.get('/products/consumers/getAll/:id', auth, authorization("farm", "read"), productsController.consumerReadAll)
router.get('/products/consumers/farm/:farmId/product/:id', auth, authorization("farm", "read"), productsController.consumerRead)

//Users
router.put('/users/update', auth, usersController.update)
router.delete('/users/delete', auth, usersController.delete)
router.post('/users/upload/profile', auth, usersController.profilePhoto)
router.get('/users/profile', auth, usersController.profile)

//Orders
router.post('/orders/create/farm/:id', auth, authorization("consumer", "create"), ordersController.create)
router.get('/orders/farms/getAll', auth, authorization("farm", "read"), ordersController.viewsAll)
router.patch('/orders/accept/order/:id', auth, authorization("farm", "update"), ordersController.accept)
router.patch('/orders/reject/order/:id', auth, authorization("farm", "update"), ordersController.reject)

export { router }
