import { codeParamSchema, idParamSchema, nifParamSchema, ruleParamSchema, transportParamSchema } from "../../src/utils/schemas/params.zod.js";
import { createCoordenateSchema } from "../../src/utils/schemas/coordinates.zod.js";

describe("strict path and coordinate schemas", () => {
  it("accepts valid identifiers and rejects malformed or unknown values", () => {
    expect(idParamSchema.safeParse({ id: "d9428888-122b-4e05-9d75-6c6e9c47c7f4" }).success).toBe(true);
    expect(idParamSchema.safeParse({ id: "not-an-id", owner: "x" }).success).toBe(false);
    expect(ruleParamSchema.safeParse({ rule: "admin" }).success).toBe(true);
    expect(transportParamSchema.safeParse({ transport: "open" }).success).toBe(false);
    expect(nifParamSchema.safeParse({ nif: "123456789" }).success).toBe(true);
    expect(codeParamSchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it("limits tracking coordinates to Angola and rejects extra fields", () => {
    const valid = { requestId: "d9428888-122b-4e05-9d75-6c6e9c47c7f4", latitude: "-8.8", longitude: "13.2" };
    expect(createCoordenateSchema.safeParse(valid).success).toBe(true);
    expect(createCoordenateSchema.safeParse({ ...valid, longitude: "0" }).success).toBe(false);
    expect(createCoordenateSchema.safeParse({ ...valid, isAdmin: true }).success).toBe(false);
  });
});
