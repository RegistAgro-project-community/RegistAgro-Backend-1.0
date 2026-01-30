import { app } from "./app";
import { prisma } from "../lib/prisma";
import open from "open";

(
    async ()=>{
        const port = 5500
        try {
            await prisma.$connect()
            await open(`http://localhost:${port}/docs`)
            app.listen(port, () =>{
                console.log(`API: http://localhost:${port}`)
                console.log(`Documentação: http://localhost:${port}/docs`)
            })
        } catch (error) {
            console.error("Falha na conexão com o servidor")
        }
})()
