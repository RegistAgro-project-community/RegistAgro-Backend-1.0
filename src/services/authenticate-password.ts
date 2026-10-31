import type { PasswordHasher } from "../utils/password-hasher.js";

export async function verifyAndUpgradePassword(
  hasher: PasswordHasher,
  storedHash: string,
  password: string,
  persistHash: (hash: string) => Promise<void>,
): Promise<boolean> {
  if (!(await hasher.verify(storedHash, password))) return false;
  if (hasher.needsRehash(storedHash)) await persistHash(await hasher.hash(password));
  return true;
}
