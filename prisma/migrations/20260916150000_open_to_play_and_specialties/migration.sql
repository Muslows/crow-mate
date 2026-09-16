CREATE TYPE "DpsSpecialty" AS ENUM ('HITSCAN', 'FLEX');
CREATE TYPE "SupportSpecialty" AS ENUM ('MAIN', 'FLEX');

ALTER TABLE "PlayerProfile" ADD COLUMN "openToTank" "OpenFlag" NOT NULL DEFAULT 'CLOSED';
ALTER TABLE "PlayerProfile" ADD COLUMN "openToDps" "OpenFlag" NOT NULL DEFAULT 'CLOSED';
ALTER TABLE "PlayerProfile" ADD COLUMN "openToSupport" "OpenFlag" NOT NULL DEFAULT 'CLOSED';
ALTER TABLE "PlayerProfile" ADD COLUMN "dpsSpecialty" "DpsSpecialty";
ALTER TABLE "PlayerProfile" ADD COLUMN "supportSpecialty" "SupportSpecialty";

CREATE INDEX "PlayerProfile_openToTank_idx" ON "PlayerProfile"("openToTank");
CREATE INDEX "PlayerProfile_openToDps_idx" ON "PlayerProfile"("openToDps");
CREATE INDEX "PlayerProfile_openToSupport_idx" ON "PlayerProfile"("openToSupport");
CREATE INDEX "PlayerProfile_dpsSpecialty_idx" ON "PlayerProfile"("dpsSpecialty");
CREATE INDEX "PlayerProfile_supportSpecialty_idx" ON "PlayerProfile"("supportSpecialty");
