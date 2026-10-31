import express  from "express";
import helmet from "helmet";
import { router } from "./router/routes.js";
import { limiter } from "./config/rate-limiting.js";
import morgan from 'morgan'
import fileupload from 'express-fileupload' 
import path from "path";
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from "./doc/swagger.js";
import { errorHandler, requestId } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";

const app = express()


const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1)
if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0 || trustedProxyHops > 10) {
  throw new Error("TRUST_PROXY_HOPS deve ser um inteiro entre 0 e 10")
}
app.set('trust proxy', trustedProxyHops)
app.use(requestId)
app.use(helmet())
app.use(morgan(":method :status :response-time ms :res[x-request-id]", { skip: (_req, res) => res.statusCode >= 500 }))
app.use(limiter)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use(fileupload({ limits: { fileSize: 5 * 1024 * 1024, files: 1 }, abortOnLimit: true }))
app.use("/upload", express.static(path.resolve("src/upload")))
if (process.env.NODE_ENV !== "production") {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
app.use(router)
app.use(notFoundHandler)
app.use(errorHandler)

export { app }
