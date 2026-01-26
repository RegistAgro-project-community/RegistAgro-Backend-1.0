import type { Response } from "express";

export function ruleValidation(rule: string | string[], res: Response){
    if(rule != "consumer" && rule != "carrier"){
        return true
    }

    return false
}
