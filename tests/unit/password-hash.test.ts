import argon2 from "argon2";
import bcrypt from "bcrypt";
import { PasswordHash } from "../../src/utils/password.hash.js";
import { Argon2idHasher } from "../../src/utils/argon2id-hasher.js";
import { BcryptLegacyHasher } from "../../src/utils/bcrypt-legacy-hasher.js";

describe("PasswordHash migration facade", () => {
  const subject = new PasswordHash();

  it("creates OWASP Argon2id hashes", async () => {
    const hash = await subject.generate("SafePassword!2026");
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,p=1,t=2\$/);
    expect(await argon2.verify(hash, "SafePassword!2026")).toBe(true);
  });

  it("verifies current and incorrect passwords", async () => {
    const encoded = await subject.generate("SafePassword!2026");
    await expect(subject.compare(encoded, "SafePassword!2026")).resolves.toBe(true);
    await expect(subject.compare(encoded, "wrong")).resolves.toBe(false);
  });

  it("verifies bcrypt legacy hashes and flags them for migration", async () => {
    const legacy = await bcrypt.hash("SafePassword!2026", 4);
    await expect(subject.compare(legacy, "SafePassword!2026")).resolves.toBe(true);
    await expect(subject.compare(legacy, "wrong")).resolves.toBe(false);
    expect(subject.needsRehash(legacy)).toBe(true);
  });

  it("rejects malformed hashes and does not rehash current Argon2id", async () => {
    await expect(subject.compare("invalid", "password")).resolves.toBe(false);
    expect(subject.needsRehash(await subject.generate("SafePassword!2026"))).toBe(false);
  });

  it("covers hasher strategies and guards malformed encodings", async () => {
    const current = new Argon2idHasher();
    await expect(current.verify("not-argon", "password")).resolves.toBe(false);
    expect(current.needsRehash("malformed-argon-prefix")).toBe(true);
    const valid = await current.hash("valid-password");
    await expect(current.verify(valid, "valid-password")).resolves.toBe(true);
    const verifySpy = jest.spyOn(argon2, "verify").mockRejectedValueOnce(new Error("malformed"));
    await expect(current.verify("$argon2id$broken", "password")).resolves.toBe(false);
    verifySpy.mockRestore();
    const rehashSpy = jest.spyOn(argon2, "needsRehash").mockImplementationOnce(() => { throw new Error("malformed"); });
    expect(current.needsRehash("$argon2id$broken")).toBe(true);
    rehashSpy.mockRestore();
    const legacy = new BcryptLegacyHasher();
    await expect(legacy.verify("not-bcrypt", "password")).resolves.toBe(false);
    expect(() => legacy.hash("password")).toThrow("Legacy bcrypt hashing is disabled");
    await expect(legacy.verify("$2b$04$invalid", "password")).resolves.toBe(false);
    const bcryptSpy = jest.spyOn(bcrypt, "compare").mockRejectedValueOnce(new Error("malformed"));
    await expect(legacy.verify("$2b$04$invalid", "password")).resolves.toBe(false);
    bcryptSpy.mockRestore();
  });

  it("exposes interface-compatible hash and verify methods", async () => {
    const encoded = await subject.hash("SafePassword!2026");
    await expect(subject.verify(encoded, "SafePassword!2026")).resolves.toBe(true);
  });
});
