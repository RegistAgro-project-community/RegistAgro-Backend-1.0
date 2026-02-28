import type { Request, Response } from "express";
import { errors } from "../errors/controllers.errors";
import { CompanyModel } from "../model/company.model";

const companiesModel = new CompanyModel()

class CompanyController {
    async getCompanies(req: Request, res: Response){
        try {
            const companiesResult = await companiesModel.getCompany()

            if(companiesResult.error){
                return res.status(400).json(companiesResult)
            }else if(companiesResult.info){
                return res.status(404).json(companiesResult)
            }

            return res.status(200).json(companiesResult)
        } catch (error) {
            errors(res)
        }
    }
}

export default new CompanyController()
