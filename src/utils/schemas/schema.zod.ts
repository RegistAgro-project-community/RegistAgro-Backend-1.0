import z, { email } from "zod";

export const signupSchema = z.object({
    name: z.string().trim().min(3, "Nome inválido").max(50, "Nome muito extenso"),
    email: z.string().trim().email({message: "Email inválido"}),
    phone: z.string().trim().min(9, "Número inválido").max(12, "O número deve conter 12 digito no máximo"),
    adress: z.string().trim().min(3, "Endereço inválido"),
    province: z.string().trim(),
    pass1: z.string().min(8, "A senha deve conter 8 caracteres no mínimo").trim(),
    pass2: z.string().trim().min(8, "A senha deve conter 8 digitos no minimo")
}).superRefine((data, ctx) =>{
    if(data.province != "Luanda" && data.province != "Bengo"){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A provincia deve ser Luanda ou Bengo",
            path: ["province"]
        })
    }
    if(data.pass1 != data.pass2){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Credencias inválidas",
            path: ["password"]
        })
    }
})
