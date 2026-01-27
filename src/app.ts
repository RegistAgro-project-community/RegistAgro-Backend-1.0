import express  from "express";
import helmet from "helmet";
import { router } from "./router/routes";
import { limiter } from "./config/rate-limiting";
import morgan from 'morgan'
import fileupload from 'express-fileupload' 
import path from "path";

const app = express()

app.use(express.json())
app.use(fileupload())
app.use(
  "/upload",
  express.static(path.resolve("src/upload"))
)
app.use(helmet())
app.use(limiter)
app.use(morgan("combined"))
app.use(router)

export { app }
