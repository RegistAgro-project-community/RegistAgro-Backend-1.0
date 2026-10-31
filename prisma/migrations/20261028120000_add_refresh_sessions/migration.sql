CREATE TABLE "refresh_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_sessions_tokenHash_key" ON "refresh_sessions"("tokenHash");
CREATE INDEX "refresh_sessions_userId_expiresAt_idx" ON "refresh_sessions"("userId", "expiresAt");

ALTER TABLE "refresh_sessions"
ADD CONSTRAINT "refresh_sessions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
