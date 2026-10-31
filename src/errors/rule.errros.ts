import type { Response } from "express";

export function ruleValidation(rule: string | string[], res: Response, allowedRules: string[] = ["consumer", "carrier"]){
    if(!allowedRules.includes(String(rule))){
        return true
    }

    return false
}
