import express  from "express";
import helmet from "helmet";
import { router } from "./router/routes";
import { limiter } from "./config/rate-limiting";
import morgan from 'morgan'

const app = express()

app.use(express.json())
app.use(helmet())
app.use(limiter)
app.use(morgan("combined"))
app.use(router)

export { app }
