import { app } from "./app";
import { prisma } from "../lib/prisma";

(
    async ()=>{
        const port = 5500
        try {
            await prisma.$connect()
            app.listen(port, () =>{
                console.log(`API: http://localhost:${port}`)
            })
        } catch (error) {
            console.error("Falha na conexão com o servidor")
        }
})()
