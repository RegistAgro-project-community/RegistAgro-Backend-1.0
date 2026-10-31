import { GeoapifyGeocoder } from "../../src/services/geocoder.js";

describe("GeoapifyGeocoder", () => {
  const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status });

  it("uses a fixed provider host, Angola search filter, timeout and redirect denial", async () => {
    const fetcher = jest.fn().mockResolvedValue(response({ features: [{
      geometry: { coordinates: [13.2, -8.8] }, properties: { formatted: "Luanda, Angola", state: "Luanda" },
    }] }));
    const subject = new GeoapifyGeocoder("private-key", fetcher);
    await expect(subject.geocode("Luanda")).resolves.toEqual({ latitude: "-8.8", longitude: "13.2", adress: "Luanda, Angola", state: "Luanda" });
    const [url, options] = fetcher.mock.calls[0] as [URL, RequestInit];
    expect(url.hostname).toBe("api.geoapify.com");
    expect(url.searchParams.get("country")).toBe("ao");
    expect(options.redirect).toBe("error");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects missing keys, empty/no matches and coordinates outside Angola", async () => {
    await expect(new GeoapifyGeocoder(undefined).geocode("Luanda")).resolves.toHaveProperty("error");
    await expect(new GeoapifyGeocoder("key").geocode("  ")).resolves.toHaveProperty("error");
    const noMatch = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [] })));
    await expect(noMatch.geocode("nowhere")).resolves.toEqual({ error: "Endereço inválido" });
    const outside = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [{ geometry: { coordinates: [0, 0] }, properties: {} }] })));
    await expect(outside.geocode("outside")).resolves.toEqual({ error: "Endereço fora de Angola" });
    const missingOptionalText = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [{ geometry: { coordinates: [13, -8] }, properties: {} }] })));
    await expect(missingOptionalText.geocode("Luanda")).resolves.toMatchObject({ adress: "", state: "" });
  });

  it("sanitizes provider errors", async () => {
    await expect(new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({}, 503))).geocode("Luanda"))
      .resolves.toEqual({ error: "Não foi possível consultar endereço" });
    await expect(new GeoapifyGeocoder("key", jest.fn().mockRejectedValue(new Error("private"))).geocode("Luanda"))
      .resolves.toEqual({ error: "Não foi possível consultar endereço" });
  });

  it("validates reverse geocoding bounds and province", async () => {
    const valid = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [{ geometry: { coordinates: [13, -8] }, properties: { state: "Bengo Province" } }] })));
    await expect(valid.reverseGeocode("-8", "13")).resolves.toEqual({ sucess: true });
    await expect(valid.reverseGeocode("-8", "0")).resolves.toHaveProperty("sucess", false);
    const outsideProvince = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [{ geometry: { coordinates: [13, -8] }, properties: { state: "Huambo" } }] })));
    await expect(outsideProvince.reverseGeocode("-8", "13")).resolves.toHaveProperty("error");
    const noProvince = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [{ geometry: { coordinates: [13, -8] }, properties: {} }] })));
    await expect(noProvince.reverseGeocode("-8", "13")).resolves.toEqual({ sucess: false });
    await expect(new GeoapifyGeocoder(undefined).reverseGeocode("-8", "13")).resolves.toHaveProperty("error");
    const luanda = new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({ features: [{ geometry: { coordinates: [13, -8] }, properties: { state: "Luanda" } }] })));
    await expect(luanda.reverseGeocode("-8", "13")).resolves.toEqual({ sucess: true });
    await expect(new GeoapifyGeocoder("key", jest.fn().mockResolvedValue(response({}, 503))).reverseGeocode("-8", "13"))
      .resolves.toHaveProperty("error");
    await expect(new GeoapifyGeocoder("key", jest.fn().mockRejectedValue(new Error("private"))).reverseGeocode("-8", "13"))
      .resolves.toHaveProperty("error");
  });
});
