import swaggerJsdoc from "swagger-jsdoc"
import { signupPath } from "./paths/auth.path"
import { signupSchema } from "./schemas/auth.schema"
import { verificationCodePath } from "./paths/verification-code"
import { nifPath } from "./paths/nif.path"
import { farmPassSchema } from "./schemas/signup.schema"
import { farmPassordPath } from "./paths/signup.path"
import { farmLoginPath } from "./paths/farm-login"
import { farmLoginSchema } from "./schemas/farm-login.schema"
import { loginPath } from "./paths/login.path"
import { loginSchema } from "./schemas/login.schema"
import { createProductPath } from "./paths/create-product"
import { createProductSchema } from "./schemas/create-product"
import { productPhotoPath } from "./paths/products-img"
import { productPhotoSchema } from "./schemas/product-img"
import { updateProductPath } from "./paths/update-product"
import { updateProductSchema } from "./schemas/update-product"
import { getAllProductsPath } from "./paths/getAll-products"
import { getProductPath } from "./paths/get-product"
import { deleteProductPath } from "./paths/delete-product"
import { consumerGetAllProductPath } from "./paths/consumer-getAll-product"
import { consumerGetAProductPath } from "./paths/consumer-get-product"
import { userUpdatePath } from "./paths/user-update.path"
import { updateUserSchema } from "./schemas/update-user.schema"
import { deleteUserPath } from "./paths/delete-user.path"
import { userProfilePhotoPath } from "./paths/user-img.path"
import { userProfilePhotoSchema } from "./schemas/user-img.schema"
import { userProfilePath } from "./paths/user-profile.path"
import { createOrderPath } from "./paths/create-order.path"
import { createOrderSchema } from "./schemas/create-oder.schema"
import { getAllOrdersFarmsPath } from "./paths/getAll-ordersFarm"
import { acceptOrdersPath } from "./paths/accept-orders"
import { sentOrdersPath } from "./paths/sent-orders"
import { cancelOrdersPath } from "./paths/cancel-orders"
import { updateOrdersPath } from "./paths/update-orders.path"
import { deleteOrderPath } from "./paths/delete-order"
import { updateOrdersSchema } from "./schemas/update-orders.schema"

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "RegistAgro API",
      description: "Oficial RegistAgro documentation",
      version: "1.0.0"
    },

    servers: [
      {
        url: "http://localhost:5500",
        description: "Servidor local"
      }
    ],

    tags: [
      { name: "Auth", description: "Authentication routes" },
      { name: "Products", description: "Farm Products"},
      { name: "Users", description: "Users actions routes"},
      {name: "Orders", description: "Orders endpoints"}
    ],

    paths: {
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
        ...userUpdatePath,
        ...deleteUserPath,
        ...userProfilePhotoPath,
        ...userProfilePath,
        ...createOrderPath,
        ...getAllOrdersFarmsPath,
        ...acceptOrdersPath,
        ...sentOrdersPath,
        ...cancelOrdersPath,
        ...updateOrdersPath,
        ...deleteOrderPath
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
        ...updateOrdersSchema
      }
    }
  },
  apis: [] 
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
