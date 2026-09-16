-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "teamId" DROP NOT NULL;

ALTER TABLE "Player" DROP CONSTRAINT IF EXISTS "Player_teamId_fkey";

ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Partial unique BattleTags on account profiles (empty tags stay shareable)
CREATE UNIQUE INDEX IF NOT EXISTS "PlayerProfile_battleTag_unique"
ON "PlayerProfile" ("battleTag")
WHERE "battleTag" <> '';
