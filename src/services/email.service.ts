import 'dotenv/config'
import { transporter } from '../config/email.conf.js'

async function sendEmail(email: string, code: string){
    //Enviar email
    try {
        await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject: "Código de Verificação - RegistAgro",
                html: `
                    <h2>Verificação de Segurança - RegistAgro</h2>

                    <p>Olá, </p>

                    <p>Recebemos uma solicitação de acesso à sua conta no <strong>RegistAgro</strong>.</p>

                    <p>Seu código de verificação é:</p>

                    <h1 style="letter-spacing: 4px; font-size: 32px; margin: 10px 0;">${code}</h1>

                    <p><strong>O código expira em 10 minutos.</strong></p>

                    <p>Se você não solicitou este código, basta ignorar este e-mail.</p>

                    <p>Atenciosamente,<br>
                    <strong>Equipe RegistAgro</strong></p>

                `
            })

        return {valid: true}
    } catch (error) {
        return {error: "Não foi possível enviar email de verificação"}
    }
}

export { sendEmail }
