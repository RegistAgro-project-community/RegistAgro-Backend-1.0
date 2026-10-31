import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import 'dotenv/config'

const connectionString = `${process.env.DATABASE_URL}`
const poolMax = Number(process.env.DATABASE_POOL_MAX ?? 5)
if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 100) {
  throw new Error("DATABASE_POOL_MAX deve ser um inteiro entre 1 e 100")
}
const adapter = new PrismaPg({ connectionString, max: poolMax })
const prisma = new PrismaClient({ adapter })

export { prisma }
