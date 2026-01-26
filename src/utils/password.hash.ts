import bcrypt from 'bcrypt'
import 'dotenv/config'

class PasswordHash{
    async generate(pass: string){
        const salt: number = 10

        try {
            const createHash = await bcrypt.hash(pass, salt)
    
            return createHash
        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }

    async compare(hash: string, pass: string){
        try {
            const isValidPassword = await bcrypt.compare(pass, hash)
            return isValidPassword

        } catch (error) {
            return {error: "Ocorreu um erro ao verificar informações"}
        }
    }
}

export { PasswordHash }
