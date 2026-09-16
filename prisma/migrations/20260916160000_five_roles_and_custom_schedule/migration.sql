CREATE TYPE "PlayerRole_new" AS ENUM ('TANK', 'DPS_HITSCAN', 'DPS_FLEX', 'MAIN_SUPPORT', 'FLEX_SUPPORT');

ALTER TABLE "Player" ADD COLUMN "role_new" "PlayerRole_new" NOT NULL DEFAULT 'TANK';
ALTER TABLE "PlayerProfile" ADD COLUMN "role_new" "PlayerRole_new" NOT NULL DEFAULT 'TANK';
ALTER TABLE "PlayerProfile" ADD COLUMN "openToPlay" "PlayerRole_new"[] NOT NULL DEFAULT ARRAY[]::"PlayerRole_new"[];

UPDATE "Player" SET "role_new" = CASE
  WHEN "role"::text = 'TANK' THEN 'TANK'::"PlayerRole_new"
  WHEN "role"::text = 'DPS' THEN 'DPS_FLEX'::"PlayerRole_new"
  WHEN "role"::text = 'SUPPORT' THEN 'FLEX_SUPPORT'::"PlayerRole_new"
  ELSE 'TANK'::"PlayerRole_new"
END;

UPDATE "PlayerProfile" SET "role_new" = CASE
  WHEN "primaryRole"::text = 'TANK' THEN 'TANK'::"PlayerRole_new"
  WHEN "primaryRole"::text = 'DPS' AND "dpsSpecialty"::text = 'HITSCAN' THEN 'DPS_HITSCAN'::"PlayerRole_new"
  WHEN "primaryRole"::text = 'DPS' THEN 'DPS_FLEX'::"PlayerRole_new"
  WHEN "primaryRole"::text = 'SUPPORT' AND "supportSpecialty"::text = 'MAIN' THEN 'MAIN_SUPPORT'::"PlayerRole_new"
  WHEN "primaryRole"::text = 'SUPPORT' THEN 'FLEX_SUPPORT'::"PlayerRole_new"
  ELSE 'TANK'::"PlayerRole_new"
END;

UPDATE "PlayerProfile" SET "openToPlay" = ARRAY(
  SELECT DISTINCT x FROM unnest(ARRAY[
    CASE WHEN "openToTank" = 'OPEN' THEN 'TANK'::"PlayerRole_new" END,
    CASE WHEN "openToDps" = 'OPEN' AND "dpsSpecialty"::text = 'HITSCAN' THEN 'DPS_HITSCAN'::"PlayerRole_new" END,
    CASE WHEN "openToDps" = 'OPEN' AND ("dpsSpecialty" IS NULL OR "dpsSpecialty"::text <> 'HITSCAN') THEN 'DPS_FLEX'::"PlayerRole_new" END,
    CASE WHEN "openToSupport" = 'OPEN' AND "supportSpecialty"::text = 'MAIN' THEN 'MAIN_SUPPORT'::"PlayerRole_new" END,
    CASE WHEN "openToSupport" = 'OPEN' AND ("supportSpecialty" IS NULL OR "supportSpecialty"::text <> 'MAIN') THEN 'FLEX_SUPPORT'::"PlayerRole_new" END,
    "role_new"
  ]) AS x WHERE x IS NOT NULL
);

ALTER TABLE "Player" DROP COLUMN "secondaryRole";
ALTER TABLE "Player" DROP COLUMN "role";
ALTER TABLE "Player" RENAME COLUMN "role_new" TO "role";

DROP INDEX IF EXISTS "PlayerProfile_openToTank_idx";
DROP INDEX IF EXISTS "PlayerProfile_openToDps_idx";
DROP INDEX IF EXISTS "PlayerProfile_openToSupport_idx";
DROP INDEX IF EXISTS "PlayerProfile_dpsSpecialty_idx";
DROP INDEX IF EXISTS "PlayerProfile_supportSpecialty_idx";

ALTER TABLE "PlayerProfile" DROP COLUMN "primaryRole";
ALTER TABLE "PlayerProfile" DROP COLUMN "secondaryRole";
ALTER TABLE "PlayerProfile" DROP COLUMN "openToTank";
ALTER TABLE "PlayerProfile" DROP COLUMN "openToDps";
ALTER TABLE "PlayerProfile" DROP COLUMN "openToSupport";
ALTER TABLE "PlayerProfile" DROP COLUMN "dpsSpecialty";
ALTER TABLE "PlayerProfile" DROP COLUMN "supportSpecialty";
ALTER TABLE "PlayerProfile" RENAME COLUMN "role_new" TO "role";

DROP TYPE "PlayerRole";
ALTER TYPE "PlayerRole_new" RENAME TO "PlayerRole";

ALTER TYPE "OfficialScrimSlot" ADD VALUE IF NOT EXISTS 'VOD_REVIEW';
ALTER TYPE "OfficialScrimSlot" ADD VALUE IF NOT EXISTS 'TOURNOI';
ALTER TYPE "OfficialScrimSlot" ADD VALUE IF NOT EXISTS 'CUSTOM';

ALTER TABLE "OfficialSchedule" ADD COLUMN "mondayNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfficialSchedule" ADD COLUMN "tuesdayNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfficialSchedule" ADD COLUMN "wednesdayNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfficialSchedule" ADD COLUMN "thursdayNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfficialSchedule" ADD COLUMN "fridayNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfficialSchedule" ADD COLUMN "saturdayNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfficialSchedule" ADD COLUMN "sundayNote" TEXT NOT NULL DEFAULT '';
