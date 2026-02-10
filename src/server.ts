import { app } from "./app.js";
import { prisma } from "../lib/prisma";
import open from "open";
import 'dotenv/config'

const port = Number(process.env.PORT) || 5500
//await open(`http://localhost:${port}/docs`)

app.listen(port, '0.0.0.0', () =>{
    console.log(`API: http://localhost:${port}`)
    console.log(`Documentação: http://localhost:${port}/docs`)
})
