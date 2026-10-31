import type { PasswordHasher } from "./password-hasher.js";
import { Argon2idHasher } from "./argon2id-hasher.js";
import { BcryptLegacyHasher } from "./bcrypt-legacy-hasher.js";

/** Compatibility facade used by existing models during the hash migration. */
export class PasswordHash implements PasswordHasher {
  private readonly current = new Argon2idHasher();
  private readonly legacy = new BcryptLegacyHasher();

  generate(password: string): Promise<string> {
    return this.current.hash(password);
  }

  hash(password: string): Promise<string> { return this.generate(password); }

  compare(encodedHash: string, password: string): Promise<boolean> {
    return encodedHash.startsWith("$argon2id$")
      ? this.current.verify(encodedHash, password)
      : this.legacy.verify(encodedHash, password);
  }

  verify(encodedHash: string, password: string): Promise<boolean> { return this.compare(encodedHash, password); }

  needsRehash(encodedHash: string): boolean {
    return this.current.needsRehash(encodedHash) || this.legacy.needsRehash(encodedHash);
  }
}
