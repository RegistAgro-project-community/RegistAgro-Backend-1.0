import { geocoder } from "./geocoder.js";

/** Backwards-compatible functional adapter; consumers may inject the Geocoder interface. */
export const getAltLong = (address: string) => geocoder.geocode(address);
export const getAdress = (latitude: string, longitude: string) => geocoder.reverseGeocode(latitude, longitude);
