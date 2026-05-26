import { isAngolaPhoneValid } from "validador-numero-angola"
import EmailValidator from 'email-validator'

class DataValidate{
    name(name: string){
        if(name.length <= 3){
            return false
        }

        const hasInvalidChar = /[^a-zA-ZÀ-ÿ\s]/.test(name)
        if (hasInvalidChar) {
            return false
        }

        if (name.trimStart() != name) {
            return false
        }
        
        //Removendo os espaços e transformando em capitalize
        const arrayNames = name.split(" ")
        let configName: string[] = []

        arrayNames.map(e =>{
            configName.push(e.trim().charAt(0).toUpperCase() + e.trim().slice(1).toLocaleLowerCase())
        })

        const fullName = configName.join(" ")
        return fullName
        
    }

    email(email: string){
        //Validando email
        const validador = EmailValidator
        return validador.validate(email)
    }

    password(pass: string){
        const error: string[] = []
        let points = 0

        if (pass.length < 8) {
            error.push('Senha deve ter no mínimo 8 caracteres')
        } else {
            points++
            if (pass.length >= 12) points++
            if (pass.length >= 16) points++
        }

        if (pass.length < 8) {
            error.push('Senha deve ter no mínimo 8 caracteres')
        } else {
            points++
            if (pass.length >= 12) {points++}
            if (pass.length >= 16) {points++}

        }

        if (!/[A-Z]/.test(pass)) {
            error.push('Senha deve conter letras maiúsculas')
        } else {
            points++
        }

        if (!/\d/.test(pass)) {
            error.push('Senha deve conter números')
        } else {
            points++
        }

        // Caracteres especiais
        if (!/[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/\\|`~]/.test(pass)) {
            error.push('Senha deve conter caracteres especiais')
        } else {
            points++
        }

        let strong: 'fraca' | 'media' | 'forte' = 'fraca'
        if (points >= 5 && error.length == 0){
            strong = 'forte'
        }
        else if (points >= 3){ 
            strong = 'media'
        }

        return {
            valid: error.length === 0,
            error,
            strong
        }

    }

    phoneNumber(number: string){
        const validNumber = isAngolaPhoneValid(number)
        if(!validNumber){
            return false
        }

        return true

    }

}

export { DataValidate }
