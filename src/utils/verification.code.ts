import { totp } from "otplib"
import 'dotenv/config'

class VerificationCode{
    generate(){
        //Tempo de validação de 10 minutos
        totp.options = {step: 600}

        const code = totp.generate(process.env.SECRET_KEY as string)
        return code

    }

    verify(code: string){
        const validCode = totp.verify({token: code, secret: process.env.SECRET_KEY!})

        return validCode
    }
}

export { VerificationCode }
