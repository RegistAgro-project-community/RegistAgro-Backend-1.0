import { createClient } from 'redis'
import 'dotenv/config'

    const redisClient = createClient({
        username: process.env.REDIS_USER!,
        password: process.env.REDIS_PASS!,
        socket: {
            host: 'redis-15935.crce214.us-east-1-3.ec2.cloud.redislabs.com',
            port: 15935
        }
    });

    redisClient.on('error', err => console.error('Redis Client Error'))

    try {
        await redisClient.connect()
        
        await redisClient.set('foo', 'bar')
        const result = await redisClient.get('foo')
        console.log(result)  
        
    } catch (error) {
        console.error("Erro no Redis Client")
    }

export { redisClient }
