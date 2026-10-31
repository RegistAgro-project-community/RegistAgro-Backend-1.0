import { verifyAndUpgradePassword } from "../../src/services/authenticate-password.js";
import type { PasswordHasher } from "../../src/utils/password-hasher.js";

describe("transparent password migration", () => {
  const makeHasher = (valid: boolean, rehash: boolean): PasswordHasher => ({
    verify: jest.fn().mockResolvedValue(valid),
    needsRehash: jest.fn().mockReturnValue(rehash),
    hash: jest.fn().mockResolvedValue("$argon2id$upgraded"),
  });

  it("upgrades a valid legacy password", async () => {
    const hasher = makeHasher(true, true);
    const persist = jest.fn().mockResolvedValue(undefined);
    await expect(verifyAndUpgradePassword(hasher, "$2b$legacy", "valid", persist)).resolves.toBe(true);
    expect(persist).toHaveBeenCalledWith("$argon2id$upgraded");
  });

  it("does not upgrade a wrong password or rewrite a current hash", async () => {
    const wrong = makeHasher(false, true);
    const persistWrong = jest.fn();
    await expect(verifyAndUpgradePassword(wrong, "$2b$legacy", "wrong", persistWrong)).resolves.toBe(false);
    expect(persistWrong).not.toHaveBeenCalled();

    const current = makeHasher(true, false);
    const persistCurrent = jest.fn();
    await expect(verifyAndUpgradePassword(current, "$argon2id$current", "valid", persistCurrent)).resolves.toBe(true);
    expect(persistCurrent).not.toHaveBeenCalled();
  });
});
