-- CreateEnum
CREATE TYPE "DayAvailability" AS ENUM ('DISPO_20H', 'DISPO_21H', 'INCERTAIN', 'INDISPO');

-- CreateTable
CREATE TABLE "WeeklyAvailability" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "monday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "tuesday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "wednesday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "thursday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "friday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "saturday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "sunday" "DayAvailability" NOT NULL DEFAULT 'INDISPO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyAvailability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WeeklyAvailability_playerId_weekStartDate_key" ON "WeeklyAvailability"("playerId", "weekStartDate");
CREATE INDEX "WeeklyAvailability_weekStartDate_idx" ON "WeeklyAvailability"("weekStartDate");

ALTER TABLE "WeeklyAvailability" ADD CONSTRAINT "WeeklyAvailability_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
