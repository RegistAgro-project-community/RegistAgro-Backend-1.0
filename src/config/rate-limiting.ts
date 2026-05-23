import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    max: 100,
    message: {
        error: "Limite de requisições excedido",
        retryAfter: "5 minutos"
    },
    handler: (req, res) =>{
        return res.status(429).json({
            error: "Limite de requisições excedido",
            retryAfter: "1 minuto0"
        })
    }
})

export { limiter }
