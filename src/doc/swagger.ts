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
      { name: "Products", description: "Farm Products"}
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
        ...deleteProductPath
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
        ...updateProductSchema
      }
    }
  },
  apis: [] 
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
