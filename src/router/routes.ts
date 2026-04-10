import { Router } from "express";
import authController from "../controllers/auth/auth.controller.js";
import { auth } from "../middlewares/auth.js";
import { authorization } from "../middlewares/authorization.js";
import productsController from "../controllers/products.controller.js";
import usersController from "../controllers/users.controller.js";
import ordersController from "../controllers/orders.controller.js";
import { healthyRoute } from "../controllers/healthy.controller.js";
import companyController from "../controllers/company.controller.js";
import paymentController from "../controllers/payment.controller.js";
import transportController from "../controllers/transport.controller.js";
import { permission } from "../middlewares/permision.js";
import { validAccount } from "../middlewares/validAccount.js";

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
router.post('/products/create', auth, validAccount(), authorization("farm", "create"), productsController.create)
router.patch('/products/upload/product/:id', auth, validAccount(), authorization("farm", "update"), productsController.productPhoto)
router.put('/products/update/product/:id', auth, validAccount(), authorization("farm", "update"), productsController.update)
router.get('/products/farms/get/products', auth, validAccount(), authorization("farm", "read"), permission("farm"), productsController.getAll)
router.get('/products/farms/get/product/:id', auth, validAccount(), authorization("farm", "read"), permission("farm"), productsController.get)
router.delete('/products/delete/product/:id', auth, validAccount(), authorization("farm", "delete"), productsController.delete)
router.get('/products/consumers/get/farm/:id', auth, validAccount(), authorization("consumer", "read"), permission("consumer"), productsController.consumerReadAll)
router.get('/products/consumers/product/:id', auth, validAccount(), authorization("consumer", "read"), permission("consumer"), productsController.consumerRead)
router.get('/products/consumers/get/products', auth, validAccount(), authorization("consumer", "read"), permission("consumer"), productsController.consumerGetAll)

//Users
router.put('/users/update', auth, validAccount(), usersController.update)
router.delete('/users/delete', auth, validAccount(), usersController.delete)
router.post('/users/upload/profile', auth, validAccount(),usersController.profilePhoto)
router.get('/users/profile', auth, validAccount(), usersController.profile)

//Orders
router.post('/orders/create/farm/:id', auth, validAccount(), authorization("consumer", "create"), ordersController.create)
router.patch('/orders/payment/confirm', auth, validAccount(), authorization("consumer", "update"), paymentController.confirm)
router.get('/orders/farms/order/get', auth, validAccount(), authorization("farm", "read"), permission("farm"), ordersController.viewsAll)
router.patch('/orders/accept/order/:id', auth, validAccount(), authorization("farm", "update"), ordersController.accept)
router.patch('/orders/reject/order/:id', auth, validAccount(), authorization("farm", "update"), ordersController.reject)
router.get('/orders/consumers/order/sent', auth, validAccount(), authorization("consumer", "read"), permission("consumer"), ordersController.sentOrders)
router.patch('/orders/consumers/cancel/order/:id', auth, validAccount(), authorization("consumer", "update"), ordersController.cancelOrder)
router.put('/orders/consumers/update/order/:id', auth, validAccount(), authorization("consumer", "update"), ordersController.updateOrder)
router.delete('/orders/consumers/delete/order/:id', auth, validAccount(), authorization("consumer", "delete"), ordersController.deleteOrder)

//Transports
router.post('/transports/vehicle/create', auth, validAccount(), authorization("carrier", "create"), transportController.createTransport)
router.get('/transports/farms/get/vehicle/:transport', auth, validAccount(), authorization("farm", "read"), permission("farm"), transportController.showCarriers)
router.post('/transports/request', auth, validAccount(), authorization("farm", "create"), transportController.hireCarrier)
router.get('/transports/carriers/vehicles', auth, validAccount(), authorization("carrier", "read"), permission("carrier"), transportController.myVehicles)
router.get('/transports/carrier/request/get', auth, validAccount(), authorization("carrier", "read"), permission("carrier"), transportController.getRequest)

export { router }
