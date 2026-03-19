import { Router } from "express";
import authController from "../controllers/auth/auth.controller.js";
import { auth } from "../middlewares/auth.js";
import { authorization } from "../middlewares/permissions.js";
import productsController from "../controllers/products.controller.js";
import usersController from "../controllers/users.controller.js";
import ordersController from "../controllers/orders.controller.js";
import { healthyRoute } from "../controllers/healthy.controller.js";
import companyController from "../controllers/company.controller.js";
import paymentController from "../controllers/payment.controller.js";
import transportController from "../controllers/transport.controller.js";

const router = Router()

//Healthy
router.get('/', healthyRoute)

//Farms Companies
router.get('/companies/get', companyController.getCompanies)

//Token
router.get('/token', auth, authController.verifyToken)

//Auth
router.post('/auth/signup/:rule', authController.signup)
router.get('/auth/signup/verify/:code', authController.verifyCode)
router.get('/auth/signup/nif/:nif', authController.verifyNif)
router.post('/auth/farm/signup', auth, authorization("farm", "create"), authController.createFarmPass)
router.post('/auth/farm/login', authController.farmSignIn)
router.post('/auth/login', authController.login)

//Products
router.post('/products/create', auth, authorization("farm", "create"), productsController.create)
router.patch('/products/upload/product/:id', auth, authorization("farm", "update"), productsController.productPhoto)
router.put('/products/update/product/:id', auth, authorization("farm", "update"), productsController.update)
router.get('/products/farms/get/products', auth, authorization("farm", "read"), productsController.getAll)
router.get('/products/farms/get/product/:id', auth, authorization("farm", "read"), productsController.get)
router.delete('/products/delete/product/:id', auth, authorization("farm", "delete"), productsController.delete)
router.get('/products/consumers/get/farm/:id', auth, authorization("consumer", "read"), productsController.consumerReadAll)
router.get('/products/consumers/product/:id', auth, authorization("consumer", "read"), productsController.consumerRead)
router.get('/products/consumers/get/products', auth, authorization("consumer", "read"), productsController.consumerGetAll)

//Users
router.put('/users/update', auth, usersController.update)
router.delete('/users/delete', auth, usersController.delete)
router.post('/users/upload/profile', auth, usersController.profilePhoto)
router.get('/users/profile', auth, usersController.profile)

//Orders
router.post('/orders/create/farm/:id', auth, authorization("consumer", "create"), ordersController.create)
router.patch('/orders/payment/confirm', auth, authorization("consumer", "update"), paymentController.confirm)
router.get('/orders/farms/order/get', auth, authorization("farm", "read"), ordersController.viewsAll)
router.patch('/orders/accept/order/:id', auth, authorization("farm", "update"), ordersController.accept)
router.patch('/orders/reject/order/:id', auth, authorization("farm", "update"), ordersController.reject)
router.get('/orders/consumers/order/sent', auth, authorization("consumer", "create"), ordersController.sentOrders)
router.patch('/orders/consumers/cancel/order/:id', auth, authorization("consumer", "update"), ordersController.cancelOrder)
router.put('/orders/consumers/update/order/:id', auth, authorization("consumer", "update"), ordersController.updateOrder)
router.delete('/orders/consumers/delete/order/:id', auth, authorization("consumer", "delete"), ordersController.deleteOrder)

//Transports
router.post('/transports/vehicle/create', auth, authorization("carrier", "create"), transportController.createTransport)
router.get('/transports/farms/get/vehicle/:transport', auth, authorization("farm", "read"), transportController.showCarriers)
router.post('/transports/request', auth, authorization("farm", "create"), transportController.hireCarrier)

export { router }
