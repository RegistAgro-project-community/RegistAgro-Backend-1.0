import swaggerJsdoc from "swagger-jsdoc"
import { signupPath } from "./paths/auth.path.js"
import { signupSchema } from "./schemas/auth.schema.js"
import { verificationCodePath } from "./paths/verification-code.js"
import { nifPath } from "./paths/nif.path.js"
import { farmPassSchema } from "./schemas/signup.schema.js"
import { farmPassordPath } from "./paths/signup.path.js"
import { farmLoginPath } from "./paths/farm-login.js"
import { farmLoginSchema } from "./schemas/farm-login.schema.js"
import { loginPath } from "./paths/login.path.js"
import { loginSchema } from "./schemas/login.schema.js"
import { createProductPath } from "./paths/create-product.js"
import { createProductSchema } from "./schemas/create-product.js"
import { productPhotoPath } from "./paths/products-img.js"
import { productPhotoSchema } from "./schemas/product-img.js"
import { updateProductPath } from "./paths/update-product.js"
import { updateProductSchema } from "./schemas/update-product.js"
import { getAllProductsPath } from "./paths/getAll-products.js"
import { getProductPath } from "./paths/get-product.js"
import { deleteProductPath } from "./paths/delete-product.js"
import { consumerGetAllProductPath } from "./paths/consumer-getAll-FarmProduct.js"
import { consumerGetAProductPath } from "./paths/consumer-get-product.js"
import { userUpdatePath } from "./paths/user-update.path.js"
import { updateUserSchema } from "./schemas/update-user.schema.js"
import { deleteUserPath } from "./paths/delete-user.path.js"
import { userProfilePhotoPath } from "./paths/user-img.path.js"
import { userProfilePhotoSchema } from "./schemas/user-img.schema.js"
import { userProfilePath } from "./paths/user-profile.path.js"
import { createOrderPath } from "./paths/create-order.path.js"
import { createOrderSchema } from "./schemas/create-oder.schema.js"
import { getAllOrdersFarmsPath } from "./paths/getAll-ordersFarm.js"
import { acceptOrdersPath } from "./paths/accept-orders.js"
import { sentOrdersPath } from "./paths/sent-orders.js"
import { cancelOrdersPath } from "./paths/cancel-orders.js"
import { updateOrdersPath } from "./paths/update-orders.path.js"
import { deleteOrderPath } from "./paths/delete-order.js"
import { updateOrdersSchema } from "./schemas/update-orders.schema.js"
import { consumerGetEveryProductPath } from "./paths/consumer-getAll-products.js"
import { verifyAcessTokenPath } from "./paths/verifyAcessToken.js"
import { getAllCompaniesPath } from "./paths/get-all-companies.js"
import { confirmPaymentPath } from "./paths/confirmPayment.path.js"
import { confirmPaymentSchema } from "./schemas/confirmPayment.schema.js"

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "RegistAgro API",
      description: "Oficial RegistAgro API documentation",
      version: "1.0.0"
    },

    servers: [
      {
        url: "http://localhost:5500",
        description: "Servidor local"
      },
      {
        url: "https://api-registagro.onrender.com",
        description: "Web Server"
      }
    ],

    tags: [
      { name: "Company", description: "Ver todas as empresas"},
      { name: "Token", description: "Confirma validade do token de acesso"},
      { name: "Auth", description: "Authentication routes" },
      { name: "Products", description: "Farm Products"},
      { name: "Users", description: "Users actions routes"},
      {name: "Orders", description: "Orders endpoints"}
    ],

    paths: {
      ...getAllCompaniesPath,
      ...verifyAcessTokenPath,
      ...signupPath,
      ...verificationCodePath,
      ...nifPath,
      ...farmPassordPath,
      ...farmLoginPath,
      ...loginPath,
      ...createProductPath,
      ...productPhotoPath,
      ...updateProductPath,
      ...getAllProductsPath,
      ...getProductPath,
      ...deleteProductPath,
      ...consumerGetAllProductPath,
      ...consumerGetAProductPath,
      ...consumerGetEveryProductPath,
      ...userUpdatePath,
      ...deleteUserPath,
      ...userProfilePhotoPath,
      ...userProfilePath,
      ...createOrderPath,
      ...confirmPaymentPath,
      ...getAllOrdersFarmsPath,
      ...acceptOrdersPath,
      ...sentOrdersPath,
      ...cancelOrdersPath,
      ...updateOrdersPath,
      ...deleteOrderPath,
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "Bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ...signupSchema,
        ...farmPassSchema,
        ...farmLoginSchema,
        ...loginSchema,
        ...createProductSchema,
        ...productPhotoSchema,
        ...updateProductSchema,
        ...updateUserSchema,
        ...userProfilePhotoSchema,
        ...createOrderSchema,
        ...confirmPaymentSchema,
        ...updateOrdersSchema
      }
    }
  },
  apis: [] 
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
