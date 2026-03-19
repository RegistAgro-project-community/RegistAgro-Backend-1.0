import dayjs from "dayjs";
import type { UploadedFile } from "express-fileupload";
import path from "node:path";
import 'dotenv/config'
import { supabase } from "../../lib/supabase.js";

export interface uploadResult {
    ok: boolean,
    filename: string
}

export async function upload(img: UploadedFile, format: string, url: string, to: "user" | "product" | "vehicle"): Promise<uploadResult> {
    const rename = `${to}_${dayjs().format('DDMMYYYY_HHmmss')}.${format}`

    const pathUrl = process.env.ENV == 'dev' ? path.join(url, rename) : `${url}/${rename}`
    
    return new Promise( async (resolve, reject)=>{
        if(process.env.ENV == 'dev'){
            img.mv(pathUrl, error =>{
                if(error){
                    reject("Não foi possível salvar imagem")
                }else{
                    resolve({ok: true, filename: rename})
                }
            })
        }else{
            const { data, error } = await supabase.storage.from('Registagro').upload(
                pathUrl, 
                img.data, {
                contentType: img.mimetype,
                upsert: false
            })
    
            if(error){
                reject("Não foi possível salvar imagem")
            }else{
                const { data: publicUrlData } = supabase.storage.from('Registagro').getPublicUrl(pathUrl)
    
                const publiUrl = publicUrlData.publicUrl
    
                resolve({ok: true, filename: publiUrl})
            }

        }

    })
}
