import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 50,
    max: 50,
    message: {
        error: "Limite de requisições excedido",
        retryAfter: "5 minutos"
    },
    handler: (req, res) =>{
        return res.status(429).json({
            error: "Limite de requisições excedido",
            retryAfter: "5 minutos"
        })
    }
})

export { limiter }
