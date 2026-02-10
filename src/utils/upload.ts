import dayjs from "dayjs";
import type { UploadedFile } from "express-fileupload";
import path from "node:path";

export interface uploadResult {
    ok: boolean,
    filename: string
}

export async function upload(img: UploadedFile, format: string, url: string, to: "user" | "product"): Promise<uploadResult> {
    const rename = `${to}-${dayjs().format('DDMMYYYY_HHmmss')}.${format}`

    const pathUrl = path.join(url, rename)
    
    return new Promise((resolve, reject)=>{
        img.mv(pathUrl, error =>{
            if(error){
                reject("Não foi possível salvar imagem")
            }else{
                resolve({ok: true, filename: rename})
            }
        })
    })
}
