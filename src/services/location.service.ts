import fetch from "node-fetch";
import 'dotenv/config.js'
import type { Province } from "../../generated/prisma/enums";

interface location {
    latitude?: string
    longitude?: string
    adress?: string
    error?: string
    state?: string
}

interface GeoapifyFeature {
  geometry: {
    coordinates: [number, number]
  }
  properties: {
    formatted: string
    confidence?: number
    state: string
  }
}

interface GeoapifyResponse {
  features: GeoapifyFeature[]
  type?: string
}

interface GeoapifyLocation {
    error?: string
    sucess?: boolean
}

export async function getAltLong(adress: string): Promise<location>{
    const api_key = process.env.GEOAPIFY_KEY

    const boundingBox = "12.85,-9.40,13.80,-8.40"

    const params = new URLSearchParams({
        text: adress,
        apiKey: api_key ?? "",
        country: "ao",
        filter: `rect:${boundingBox}`,
        bias: "proximity:-8.8390,13.2344",
        limit: "5"
    })

    const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`

    try {
        const res = await fetch(url)
        const data = await res.json() as GeoapifyResponse

        
        if(data.features && data.features.length > 0){
            const coordinates = data.features[0]?.geometry.coordinates
            
            return {
                longitude: String(coordinates![0]),
                latitude: String(coordinates![1]),
                adress: data.features[0]?.properties.formatted ?? "",
                state: data.features[0]?.properties.state ?? ""
            }
        }

        return {error: "Endereço inválido"}
    } catch (error) {
        return {error: "Não foi possível consultar endereço"}
    }
}

export async function getAdress(latitude: string, longitude: string): Promise<GeoapifyLocation>{
    const api_key = process.env.GEOAPIFY_KEY
    
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${api_key ?? ""}`

    try {
        const res = await fetch(url)
        const data = await res.json() as GeoapifyResponse

        if(!data.features || !data.features[0]?.properties.state){
            return {sucess: false}
        }

        const province = data.features[0]?.properties.state.split(" ")[0] as Province

        if(province != "Bengo" && province != "Luanda"){
            return {sucess: false, error: "A sua coordenada está fora de Luanda e Bengo"}
        }

        return {sucess: true}
    } catch (error) {
        return {error: "Não foi possível verificar endereço"}
    }
}
