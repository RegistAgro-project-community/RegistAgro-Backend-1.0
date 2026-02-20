import 'dotenv/config'
import { supabase } from '../../lib/supabase.js'

interface SendEmail {
    valid?: boolean,
    error?: string
    data?: object
}

export async function sendEmailWithOTP(email: string): Promise<SendEmail>{
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {shouldCreateUser: true}
    })

    if(error){
        return {error: "Não foi possível enviar email de verificação"}
    }

    return {valid: true}
}

export async function verifyOTPCode(email: string, code: string): Promise<SendEmail> {
    const { error, data } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'email'
    })

    if(!error){
        return {valid: true, data: data}
    }

    return {error: "Código expirado ou inválido"}
}
