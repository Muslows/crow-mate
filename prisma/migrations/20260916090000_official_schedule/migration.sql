CREATE TYPE "OfficialScrimSlot" AS ENUM ('NONE', 'SCRIM_20H', 'SCRIM_21H', 'TBD');

CREATE TABLE "OfficialSchedule" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "monday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "tuesday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "wednesday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "thursday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "friday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "saturday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "sunday" "OfficialScrimSlot" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialSchedule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OfficialSchedule_teamId_weekStartDate_key" ON "OfficialSchedule"("teamId", "weekStartDate");
CREATE INDEX "OfficialSchedule_weekStartDate_idx" ON "OfficialSchedule"("weekStartDate");

ALTER TABLE "OfficialSchedule" ADD CONSTRAINT "OfficialSchedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
