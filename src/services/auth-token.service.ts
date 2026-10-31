import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import type { Rule } from "../../generated/prisma/enums.js";

const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export interface RefreshSessionStore {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  rotate(tokenHash: string, replacementHash: string, now: Date, expiresAt: Date): Promise<{ userId: string; rule: Rule } | null>;
  revoke(tokenHash: string, now: Date): Promise<boolean>;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class AuthTokenService {
  constructor(
    private readonly store: RefreshSessionStore,
    private readonly secret = process.env.SECRET_KEY ?? "",
    private readonly now: () => Date = () => new Date(),
    private readonly generateRefreshToken: () => string = () => randomBytes(48).toString("base64url"),
  ) {}

  private accessToken(userId: string, rule: Rule): string {
    return jwt.sign({ userId, rule }, this.secret, { expiresIn: ACCESS_TOKEN_LIFETIME });
  }

  private async issueWithHash(userId: string, rule: Rule, refreshToken: string): Promise<IssuedTokens> {
    const now = this.now();
    const accessToken = this.accessToken(userId, rule);
    await this.store.create(userId, hashToken(refreshToken), new Date(now.getTime() + REFRESH_TOKEN_LIFETIME_MS));
    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: 15 * 60,
    };
  }

  issue(userId: string, rule: Rule): Promise<IssuedTokens> {
    return this.issueWithHash(userId, rule, this.generateRefreshToken());
  }

  async rotate(refreshToken: string): Promise<IssuedTokens | null> {
    if (!refreshToken || refreshToken.length > 256) return null;
    const replacement = this.generateRefreshToken();
    const now = this.now();
    const identity = await this.store.rotate(
      hashToken(refreshToken),
      hashToken(replacement),
      now,
      new Date(now.getTime() + REFRESH_TOKEN_LIFETIME_MS),
    );
    if (!identity) return null;
    return {
      accessToken: this.accessToken(identity.userId, identity.rule),
      refreshToken: replacement,
      tokenType: "Bearer",
      expiresIn: 15 * 60,
    };
  }

  revoke(refreshToken: string): Promise<boolean> {
    if (!refreshToken || refreshToken.length > 256) return Promise.resolve(false);
    return this.store.revoke(hashToken(refreshToken), this.now());
  }
}
