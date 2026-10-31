import jwt from "jsonwebtoken";
import { AuthTokenService, type RefreshSessionStore } from "../../src/services/auth-token.service.js";

describe("refresh token lifecycle", () => {
  const secret = "test-secret-with-more-than-thirty-two-characters";
  const makeStore = (): jest.Mocked<RefreshSessionStore> => ({
    create: jest.fn().mockResolvedValue(undefined),
    rotate: jest.fn(),
    revoke: jest.fn(),
  });

  it("issues a short lived access token and stores only a hash of the refresh token", async () => {
    const store = makeStore();
    const service = new AuthTokenService(store, secret, () => new Date("2026-10-28T00:00:00Z"), () => "refresh-secret-value-that-is-long-enough-0001");

    const tokens = await service.issue("user-1", "consumer");
    const claims = jwt.verify(tokens.accessToken, secret) as jwt.JwtPayload;

    expect(tokens.tokenType).toBe("Bearer");
    expect(tokens.expiresIn).toBe(900);
    expect(claims.userId).toBe("user-1");
    expect(claims.exp! - claims.iat!).toBe(900);
    expect(store.create).toHaveBeenCalledWith("user-1", expect.not.stringContaining(tokens.refreshToken), new Date("2026-11-27T00:00:00.000Z"));
  });

  it("rotates a refresh token and rejects unknown or oversized tokens", async () => {
    const store = makeStore();
    store.rotate.mockResolvedValueOnce({ userId: "user-2", rule: "farm" });
    const service = new AuthTokenService(store, secret, () => new Date("2026-10-28T00:00:00Z"), () => "replacement-refresh-token-value-0002");

    const rotated = await service.rotate("old-refresh-token-value-00000001");
    expect(rotated?.refreshToken).toBe("replacement-refresh-token-value-0002");
    expect(jwt.verify(rotated!.accessToken, secret)).toMatchObject({ userId: "user-2", rule: "farm" });
    expect(store.rotate).toHaveBeenCalledWith(expect.not.stringContaining("old-refresh-token"), expect.not.stringContaining("replacement-refresh-token"), expect.any(Date), expect.any(Date));
    await expect(service.rotate("x".repeat(257))).resolves.toBeNull();
    expect(store.rotate).toHaveBeenCalledTimes(1);
  });

  it("revokes refresh tokens by hash and rejects oversized inputs", async () => {
    const store = makeStore();
    store.revoke.mockResolvedValue(true);
    const service = new AuthTokenService(store, secret);

    await expect(service.revoke("refresh-token-value-000000000001")).resolves.toBe(true);
    await expect(service.revoke("x".repeat(257))).resolves.toBe(false);
    expect(store.revoke).toHaveBeenCalledTimes(1);
  });
});
