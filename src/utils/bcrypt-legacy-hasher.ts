import bcrypt from "bcrypt";
import type { PasswordHasher } from "./password-hasher.js";

/** Read-only compatibility strategy: new password hashes must use Argon2id. */
export class BcryptLegacyHasher implements PasswordHasher {
  hash(_password: string): Promise<string> {
    throw new Error("Legacy bcrypt hashing is disabled");
  }

  async verify(encodedHash: string, password: string): Promise<boolean> {
    if (!/^\$2[aby]\$/.test(encodedHash)) return false;
    try {
      return await bcrypt.compare(password, encodedHash);
    } catch {
      return false;
    }
  }

  needsRehash(encodedHash: string): boolean {
    return /^\$2[aby]\$/.test(encodedHash);
  }
}
