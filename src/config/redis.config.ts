import { createClient } from "redis";

const redisClient = createClient()

redisClient.on("error", (error) => 
    console.log("Erro no Redis Client")
).connect()

export { redisClient }
