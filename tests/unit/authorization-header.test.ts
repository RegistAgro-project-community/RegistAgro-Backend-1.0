import { authorizationHeaderSchema } from "../../src/utils/schemas/authorization.zod.js";

describe("Authorization header schema", () => {
  it("accepts only a Bearer token header", () => {
    expect(authorizationHeaderSchema.safeParse({ authorization: "Bearer valid.jwt.token" }).success).toBe(true);
    expect(authorizationHeaderSchema.safeParse({ authorization: "Basic abc" }).success).toBe(false);
    expect(authorizationHeaderSchema.safeParse({ authorization: "Bearer " }).success).toBe(false);
    expect(authorizationHeaderSchema.safeParse({ authorization: "Bearer token", extra: "injected" }).success).toBe(false);
  });
});
