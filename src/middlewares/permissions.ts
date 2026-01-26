import type { Request, Response, NextFunction } from "express"
import { roles } from "../config/roles.conf"
import type { Rule } from "../../generated/prisma/enums"

type UserType = Rule;

function getAllowedActions(userType: UserType | null, resource: string){
    //Caso o usuário for null
    if (!userType || !roles[userType]) {
        return []
    }

    //Pegar permissões do usuário
    const permissions = roles[userType][resource as keyof typeof roles[UserType]]

    //Caso ele não ter permissão, permissions vai ser um array vazio
    if (!permissions || permissions.includes("no-permission")) {
        return []
    }
    return permissions
}

export function authorization(role: string, action: string){
    return (req: Request, res: Response, next: NextFunction) =>{
        //Pegar o tipo de usuário
        const userType = req.user?.role as Rule | null

        //Permissões do usuário atual
        const userPermision = getAllowedActions(userType, role)
        
        //Verificando se o usuario é role
        let hasPermission = false
        if(userType == role){
            hasPermission = true
        }

        if(!hasPermission){
            return res.status(403).json({message: "Acesso negado"})
        }
        
        //Verificar se tem permissão 
        if(userPermision.includes(action)){
            next()
        }else{
            return res.status(401).json({message: "Não tem permissão pra essa acção"})
        } 

    }
}
