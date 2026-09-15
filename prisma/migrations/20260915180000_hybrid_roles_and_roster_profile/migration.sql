-- AlterTable
ALTER TABLE "user" ADD COLUMN "isManager" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isPlayer" BOOLEAN NOT NULL DEFAULT false;

UPDATE "user" SET "isManager" = true WHERE role IN ('MANAGER', 'ADMIN');
UPDATE "user" SET "isPlayer" = true WHERE role = 'PLAYER';
UPDATE "user" AS u
SET "isPlayer" = true
FROM "PlayerProfile" AS p
WHERE p."userId" = u.id;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "secondaryRole" "PlayerRole";
ALTER TABLE "Player" ADD COLUMN "favoriteHeroes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Player" ADD COLUMN "experience" TEXT NOT NULL DEFAULT '';
