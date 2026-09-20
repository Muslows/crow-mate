ALTER TABLE "user"
ADD COLUMN "discordId" TEXT,
ADD COLUMN "discordUsername" TEXT NOT NULL DEFAULT '',
ADD COLUMN "discordDmBlocked" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "user_discordId_key" ON "user"("discordId");

ALTER TABLE "NotificationOutbox"
ADD COLUMN "userId" TEXT;

UPDATE "NotificationOutbox" AS outbox
SET "userId" = team."managerId"
FROM "Team" AS team
WHERE outbox."teamId" = team."id"
  AND outbox."userId" IS NULL;

DELETE FROM "NotificationOutbox" WHERE "userId" IS NULL;

ALTER TABLE "NotificationOutbox"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "NotificationOutbox"
ALTER COLUMN "teamId" DROP NOT NULL;

CREATE INDEX "NotificationOutbox_userId_createdAt_idx"
ON "NotificationOutbox"("userId", "createdAt");

ALTER TABLE "NotificationOutbox"
ADD CONSTRAINT "NotificationOutbox_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
