-- CreateEnum
CREATE TYPE "SpokenLanguage" AS ENUM (
  'FR', 'EN', 'DE', 'ES', 'IT', 'PT', 'PL', 'RU',
  'KO', 'JA', 'ZH', 'NL', 'SV', 'TR', 'AR'
);

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "language" "SpokenLanguage" NOT NULL DEFAULT 'FR';

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN "languages" "SpokenLanguage"[] DEFAULT ARRAY[]::"SpokenLanguage"[];

CREATE INDEX "Team_language_idx" ON "Team"("language");
CREATE INDEX "PlayerProfile_sr_idx" ON "PlayerProfile"("sr");
CREATE INDEX "PlayerProfile_languages_gin" ON "PlayerProfile" USING GIN ("languages");

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "PlayerProfile_battleTag_trgm" ON "PlayerProfile" USING GIN ("battleTag" gin_trgm_ops);
CREATE INDEX "user_name_trgm" ON "user" USING GIN ("name" gin_trgm_ops);
