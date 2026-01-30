import type { UploadedFile } from "express-fileupload";
import { upload } from "./upload";
import path from "path";

interface ImageUploadResult {
    success: boolean,
    filename?: string,
    error?: string,
    validFormat?: string[]
}

export async function image(img: UploadedFile | undefined, url: string, to: "user" | "product"): Promise<ImageUploadResult> {
    const formats = ["jpg", "png", "jpeg", "webp"]
    
    if(!img){
        return {success: false, error: "Nenhuma imagem foi enviada"}
    } 
    
    const formatImg = path.extname(img.name).replace(".", "").toLowerCase()
    
    if(!formatImg || !formats.includes(formatImg.toLowerCase()!)){
        return {
            success: false,
            error: "Imagem inválida",
            validFormat: ["jpg", "png", "jpeg", "webp"]
        }
    }

    try {
        const { ok, filename } = await upload(img, formatImg, url, to)

        if(ok){
            return {
                success: true,
                filename
            }
        }else{
            return {
                success: false,
                error: "Não foi possível salvar imagem"
            }
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocorreu um erro inesperado" 
        }
    }
    
}
