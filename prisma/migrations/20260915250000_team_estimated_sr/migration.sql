ALTER TABLE "Team" ADD COLUMN "estimatedSr" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "Team_estimatedSr_idx" ON "Team"("estimatedSr");
