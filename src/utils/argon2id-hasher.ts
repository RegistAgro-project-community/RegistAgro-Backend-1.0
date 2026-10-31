import argon2, { type HashOptions } from "argon2";
import type { PasswordHasher } from "./password-hasher.js";

export class Argon2idHasher implements PasswordHasher {
  private readonly options: HashOptions = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  };

  hash(password: string): Promise<string> {
    return argon2.hash(password, this.options);
  }

  async verify(encodedHash: string, password: string): Promise<boolean> {
    try {
      return encodedHash.startsWith("$argon2id$") && await argon2.verify(encodedHash, password);
    } catch {
      return false;
    }
  }

  needsRehash(encodedHash: string): boolean {
    try {
      return !encodedHash.startsWith("$argon2id$") || argon2.needsRehash(encodedHash, this.options);
    } catch {
      return true;
    }
  }
}
