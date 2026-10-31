import { createClient } from 'redis'
import 'dotenv/config'
import { ConsoleLogger } from "../services/logger.js"

    const logger = new ConsoleLogger()
    const redisClient = createClient(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {})

    redisClient.on('error', () => logger.error("redis.connection_error"))

    try {
        await redisClient.connect()
        
    } catch {
        logger.error("redis.connection_unavailable")
    }

export { redisClient }
