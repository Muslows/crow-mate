-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TeamOrgRole" AS ENUM ('PLAYER', 'CAPTAIN', 'COACH', 'MANAGER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable PlayerProfile
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "biography" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "scrimEloTank" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "scrimEloDps" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "scrimEloSupport" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "officialRankTank" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "officialRankDps" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "officialRankSupport" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlayerProfile" ADD COLUMN IF NOT EXISTS "blizzardSyncedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "PlayerProfile_scrimEloTank_idx" ON "PlayerProfile"("scrimEloTank");
CREATE INDEX IF NOT EXISTS "PlayerProfile_scrimEloDps_idx" ON "PlayerProfile"("scrimEloDps");
CREATE INDEX IF NOT EXISTS "PlayerProfile_scrimEloSupport_idx" ON "PlayerProfile"("scrimEloSupport");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerRole" "PlayerRole",
    "orgRoles" "TeamOrgRole"[] DEFAULT ARRAY['PLAYER']::"TeamOrgRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMembership_teamId_userId_key" ON "TeamMembership"("teamId", "userId");
CREATE INDEX IF NOT EXISTS "TeamMembership_userId_idx" ON "TeamMembership"("userId");
CREATE INDEX IF NOT EXISTS "TeamMembership_teamId_idx" ON "TeamMembership"("teamId");

DO $$ BEGIN
  ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Backfill from Player roster slots
INSERT INTO "TeamMembership" ("id", "teamId", "userId", "playerRole", "orgRoles", "createdAt", "updatedAt")
SELECT
  'tm_' || p."id",
  p."teamId",
  p."userId",
  p."role",
  ARRAY['PLAYER']::"TeamOrgRole"[],
  p."createdAt",
  p."updatedAt"
FROM "Player" p
WHERE p."teamId" IS NOT NULL AND p."userId" IS NOT NULL
ON CONFLICT ("teamId", "userId") DO UPDATE
SET "playerRole" = COALESCE("TeamMembership"."playerRole", EXCLUDED."playerRole");

-- Merge coaches
INSERT INTO "TeamMembership" ("id", "teamId", "userId", "playerRole", "orgRoles", "createdAt", "updatedAt")
SELECT
  'tmc_' || c."id",
  c."teamId",
  c."userId",
  NULL,
  ARRAY['COACH']::"TeamOrgRole"[],
  c."createdAt",
  CURRENT_TIMESTAMP
FROM "TeamCoach" c
ON CONFLICT ("teamId", "userId") DO UPDATE
SET "orgRoles" = (
  SELECT ARRAY(SELECT DISTINCT unnest("TeamMembership"."orgRoles" || ARRAY['COACH']::"TeamOrgRole"[]))
);

-- Merge managers / co-managers
INSERT INTO "TeamMembership" ("id", "teamId", "userId", "playerRole", "orgRoles", "createdAt", "updatedAt")
SELECT
  'tms_' || s."id",
  s."teamId",
  s."userId",
  NULL,
  ARRAY['MANAGER']::"TeamOrgRole"[],
  s."createdAt",
  CURRENT_TIMESTAMP
FROM "TeamSeat" s
ON CONFLICT ("teamId", "userId") DO UPDATE
SET "orgRoles" = (
  SELECT ARRAY(SELECT DISTINCT unnest("TeamMembership"."orgRoles" || ARRAY['MANAGER']::"TeamOrgRole"[]))
);
