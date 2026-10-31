import type { Province } from "../../generated/prisma/enums.js";

export interface GeocodeResult {
  latitude?: string;
  longitude?: string;
  adress?: string;
  error?: string;
  state?: string;
}

export interface ReverseGeocodeResult { error?: string; sucess?: boolean }

export interface Geocoder {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(latitude: string, longitude: string): Promise<ReverseGeocodeResult>;
}

interface Feature {
  geometry: { coordinates: [number, number] };
  properties: { formatted?: string; state?: string };
}
interface ResponseBody { features?: Feature[] }

export class GeoapifyGeocoder implements Geocoder {
  constructor(
    private readonly apiKey = process.env.GEOAPIFY_KEY,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async geocode(address: string): Promise<GeocodeResult> {
    if (!address.trim() || !this.apiKey) return { error: "Serviço de localização indisponível" };
    const url = new URL("https://api.geoapify.com/v1/geocode/search");
    url.search = new URLSearchParams({
      text: address,
      apiKey: this.apiKey,
      country: "ao",
      filter: "rect:12.85,-9.40,13.80,-8.40",
      bias: "proximity:-8.8390,13.2344",
      limit: "5",
    }).toString();
    try {
      const response = await this.fetcher(url, { redirect: "error", signal: AbortSignal.timeout(4000) });
      if (!response.ok) return { error: "Não foi possível consultar endereço" };
      const data = await response.json() as ResponseBody;
      const feature = data.features?.[0];
      if (!feature) return { error: "Endereço inválido" };
      const [longitude, latitude] = feature.geometry.coordinates;
      if (latitude < -18 || latitude > -4 || longitude < 11 || longitude > 24) return { error: "Endereço fora de Angola" };
      return { latitude: String(latitude), longitude: String(longitude), adress: feature.properties.formatted ?? "", state: feature.properties.state ?? "" };
    } catch {
      return { error: "Não foi possível consultar endereço" };
    }
  }

  async reverseGeocode(latitude: string, longitude: string): Promise<ReverseGeocodeResult> {
    const lat = Number(latitude), lon = Number(longitude);
    if (!Number.isFinite(lat) || lat < -18 || lat > -4 || !Number.isFinite(lon) || lon < 11 || lon > 24) {
      return { sucess: false, error: "Coordenadas fora de Angola" };
    }
    if (!this.apiKey) return { error: "Serviço de localização indisponível" };
    const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
    url.search = new URLSearchParams({ lat: String(lat), lon: String(lon), apiKey: this.apiKey }).toString();
    try {
      const response = await this.fetcher(url, { redirect: "error", signal: AbortSignal.timeout(4000) });
      if (!response.ok) return { error: "Não foi possível verificar endereço" };
      const data = await response.json() as ResponseBody;
      const state = data.features?.[0]?.properties.state;
      if (!state) return { sucess: false };
      const province = state.split(" ")[0] as Province;
      if (province !== "Bengo" && province !== "Luanda") return { sucess: false, error: "A sua coordenada está fora de Luanda e Bengo" };
      return { sucess: true };
    } catch {
      return { error: "Não foi possível verificar endereço" };
    }
  }
}

export const geocoder: Geocoder = new GeoapifyGeocoder();
