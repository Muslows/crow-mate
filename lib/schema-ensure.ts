import type { PrismaClient } from "@prisma/client";

const USER_COLUMN_STATEMENTS = [
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
  `CREATE UNIQUE INDEX IF NOT EXISTS "user_discordId_key" ON "user"("discordId")`,
];

let ensurePromise: Promise<void> | null = null;

export async function ensureAppSchema(db: PrismaClient): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const statement of USER_COLUMN_STATEMENTS) {
        await db.$executeRawUnsafe(statement);
      }
    })().catch((error) => {
      ensurePromise = null;
      console.error("[db] schema ensure", error);
      throw error;
    });
  }
  await ensurePromise;
}
