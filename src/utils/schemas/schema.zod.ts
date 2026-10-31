import z from "zod";

export const signupSchema = z.strictObject({
    captchaToken: z.string().optional(),
    name: z.string().trim().min(3, "Nome inválido").max(50, "Nome muito extenso").regex(/^[\p{L}\s]+$/u, "Nome inválido"),
    email: z.string().trim().email({message: "Email inválido"}),
    phone: z.string().trim().regex(/^\+?[0-9]{9,12}$/, "Número inválido"),
    adress: z.string().trim().min(3, "Endereço inválido"),
    province: z.string().trim(),
    pass1: z.string().min(8, "A senha deve conter 8 caracteres no mínimo").max(128).regex(/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+={}\[\]:;"'<>,.?/\\|`~-])/, "A senha deve conter maiúscula, número e símbolo"),
    pass2: z.string().min(8, "A senha deve conter 8 digitos no minimo").max(128)
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
