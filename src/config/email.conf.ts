import nodemailer from 'nodemailer'
import 'dotenv/config'

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, 
    secure: false,
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})

export { transporter }
