import type { PrismaClient } from "@prisma/client";

function createEnumSql(name: string, values: string[]) {
  const listed = values.map((value) => `'${value}'`).join(", ");
  return `DO $$ BEGIN CREATE TYPE "${name}" AS ENUM (${listed}); EXCEPTION WHEN duplicate_object THEN NULL; END $$`;
}

const SCHEMA_STATEMENTS = [
  createEnumSql("OpenFlag", ["CLOSED", "OPEN"]),
  createEnumSql("TeamLeadership", ["MANAGER", "CAPTAIN"]),
  createEnumSql("TeamSeatKind", ["PRIMARY", "CO_MANAGER"]),
  createEnumSql("TeamFormat", ["STANDARD_5V5", "CUSTOM"]),
  createEnumSql("SpokenLanguage", [
    "FR",
    "EN",
    "DE",
    "ES",
    "IT",
    "PT",
    "PL",
    "RU",
    "KO",
    "JA",
    "ZH",
    "NL",
    "SV",
    "TR",
    "AR",
  ]),
  createEnumSql("TeamGrantRole", ["COACH", "ASSISTANT_COACH", "CAPTAIN"]),
  createEnumSql("InvitationKind", ["PLAYER", "COACH"]),
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "pendingEmail" TEXT`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isDiscordPublic" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3)`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "anonymizeAfter" TIMESTAMP(3)`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "anonymizedAt" TIMESTAMP(3)`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discordId" TEXT`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discordUsername" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discordDmBlocked" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifyDiscordMessages" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifyDiscordInvitations" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifyDiscordScrims" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifyDiscordCancellations" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "openToCast" "OpenFlag" NOT NULL DEFAULT 'CLOSED'`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "openToCoach" "OpenFlag" NOT NULL DEFAULT 'CLOSED'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "user_discordId_key" ON "user"("discordId")`,
  `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "language" "SpokenLanguage" NOT NULL DEFAULT 'FR'`,
  `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "estimatedSr" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "leadership" "TeamLeadership" NOT NULL DEFAULT 'MANAGER'`,
  `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "format" "TeamFormat" NOT NULL DEFAULT 'STANDARD_5V5'`,
  `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "orgId" TEXT`,
  `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "parentTeamId" TEXT`,
  `CREATE TABLE IF NOT EXISTS "TeamSeat" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "TeamSeatKind" NOT NULL DEFAULT 'PRIMARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamSeat_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "TeamCoach" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamCoach_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "TeamPermission" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamGrantRole" NOT NULL,
    "canEditOfficialSchedule" BOOLEAN NOT NULL DEFAULT false,
    "canRecordScrim" BOOLEAN NOT NULL DEFAULT false,
    "canProposeScrim" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeamPermission_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "OpenPosition" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "PlayerRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpenPosition_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "OpenPositionApplication" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpenPositionApplication_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TeamSeat_teamId_userId_key" ON "TeamSeat"("teamId", "userId")`,
  `CREATE INDEX IF NOT EXISTS "TeamSeat_userId_idx" ON "TeamSeat"("userId")`,
  `CREATE INDEX IF NOT EXISTS "TeamSeat_teamId_kind_idx" ON "TeamSeat"("teamId", "kind")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TeamCoach_teamId_userId_key" ON "TeamCoach"("teamId", "userId")`,
  `CREATE INDEX IF NOT EXISTS "TeamCoach_userId_idx" ON "TeamCoach"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TeamPermission_teamId_userId_key" ON "TeamPermission"("teamId", "userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "OpenPosition_teamId_role_key" ON "OpenPosition"("teamId", "role")`,
  `DO $$ BEGIN ALTER TABLE "TeamSeat" ADD CONSTRAINT "TeamSeat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "TeamSeat" ADD CONSTRAINT "TeamSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "TeamCoach" ADD CONSTRAINT "TeamCoach_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "TeamCoach" ADD CONSTRAINT "TeamCoach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "TeamPermission" ADD CONSTRAINT "TeamPermission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "OpenPosition" ADD CONSTRAINT "OpenPosition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

let ensurePromise: Promise<void> | null = null;

export async function ensureAppSchema(db: PrismaClient): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        try {
          await db.$executeRawUnsafe(statement);
        } catch (error) {
          console.error("[db] schema ensure statement failed", statement.slice(0, 80), error);
          throw error;
        }
      }
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  await ensurePromise;
}
