ALTER TABLE "Scrim" ADD COLUMN "opponentTeamId" TEXT;
ALTER TABLE "Scrim" ADD COLUMN "opponentNameInput" TEXT NOT NULL DEFAULT '';

UPDATE "Scrim" SET "opponentNameInput" = "opponentName";

ALTER TABLE "Scrim" DROP COLUMN "opponentName";

CREATE INDEX "Scrim_opponentTeamId_idx" ON "Scrim"("opponentTeamId");

ALTER TABLE "Scrim" ADD CONSTRAINT "Scrim_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "ScrimMapResult"
SET "intensity" = CASE
  WHEN "intensity" >= 5 THEN 1
  WHEN "intensity" = 4 THEN 2
  WHEN "intensity" = 3 THEN 3
  WHEN "intensity" = 2 THEN 3
  WHEN "intensity" = 1 THEN 2
  ELSE 1
END;
