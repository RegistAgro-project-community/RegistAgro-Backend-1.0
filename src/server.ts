import { app } from "./app.js";
import 'dotenv/config'
import { validateRuntimeEnv } from "./config/env.js";
import { ConsoleLogger } from "./services/logger.js";

validateRuntimeEnv()
const port = Number(process.env.PORT) || 5500
//await open(`http://localhost:${port}/docs`)

app.listen(port, '0.0.0.0', () =>{
    new ConsoleLogger().info("http.server_started", { port })
})
