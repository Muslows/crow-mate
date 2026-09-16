-- Preserve existing roster data while moving ownership to Better Auth User.

CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'PLAYER', 'ADMIN');
CREATE TYPE "RankDivision" AS ENUM ('UNRANKED', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHAMPION');
CREATE TYPE "RosterStatus" AS ENUM ('STARTER', 'SUBSTITUTE', 'TRIAL');

CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

INSERT INTO "user" ("id", "name", "email", "emailVerified", "role", "createdAt", "updatedAt")
SELECT "id", "name", "email", false, 'MANAGER', "createdAt", "updatedAt"
FROM "Manager";

ALTER TABLE "Team" DROP CONSTRAINT "Team_managerId_fkey";
ALTER TABLE "Team" ADD CONSTRAINT "Team_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "Manager";

CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_userId_idx" ON "session"("userId");
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "account_userId_idx" ON "account"("userId");
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

ALTER TABLE "Player" ADD COLUMN "battleTag" TEXT NOT NULL DEFAULT 'Unknown#0000';
UPDATE "Player" SET "battleTag" = "pseudo" || '#1234';
ALTER TABLE "Player" ALTER COLUMN "battleTag" DROP DEFAULT;

ALTER TABLE "Player" ADD COLUMN "sr" INTEGER NOT NULL DEFAULT 0;
UPDATE "Player" SET "sr" = "elo";
ALTER TABLE "Player" ALTER COLUMN "sr" DROP DEFAULT;

ALTER TABLE "Player" ADD COLUMN "rankDivision" "RankDivision" NOT NULL DEFAULT 'GOLD';
ALTER TABLE "Player" ADD COLUMN "status" "RosterStatus" NOT NULL DEFAULT 'STARTER';

DROP INDEX IF EXISTS "Player_elo_idx";
ALTER TABLE "Player" DROP COLUMN "pseudo";
ALTER TABLE "Player" DROP COLUMN "elo";
CREATE INDEX "Player_sr_idx" ON "Player"("sr");
