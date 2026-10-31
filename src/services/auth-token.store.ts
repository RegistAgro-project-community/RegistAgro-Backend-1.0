import { prisma } from "../../lib/prisma.js";
import { AuthTokenService, type RefreshSessionStore } from "./auth-token.service.js";

class PrismaRefreshSessionStore implements RefreshSessionStore {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.refresh_sessions.create({ data: { userId, tokenHash, expiresAt } });
  }

  async rotate(tokenHash: string, replacementHash: string, now: Date, expiresAt: Date) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.refresh_sessions.findUnique({
        where: { tokenHash },
        include: { user: { select: { rule: true, status: true } } },
      });
      if (!current || current.revokedAt || current.expiresAt <= now || current.user.status !== "active") return null;

      const claimed = await tx.refresh_sessions.updateMany({
        where: { id: current.id, revokedAt: null, expiresAt: { gt: now } },
        data: { revokedAt: now },
      });
      if (claimed.count !== 1) return null;

      await tx.refresh_sessions.create({ data: { userId: current.userId, tokenHash: replacementHash, expiresAt } });
      return { userId: current.userId, rule: current.user.rule };
    });
  }

  async revoke(tokenHash: string, now: Date): Promise<boolean> {
    const result = await prisma.refresh_sessions.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: now },
    });
    return result.count === 1;
  }
}

export const authTokenService = new AuthTokenService(new PrismaRefreshSessionStore());
