CREATE TYPE "TeamGrantRole" AS ENUM ('COACH', 'ASSISTANT_COACH', 'CAPTAIN');
CREATE TYPE "ScrimProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE "TeamPermission" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamGrantRole" NOT NULL,
    "canEditOfficialSchedule" BOOLEAN NOT NULL DEFAULT false,
    "canRecordScrim" BOOLEAN NOT NULL DEFAULT false,
    "canProposeScrim" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamPermission_teamId_userId_key" ON "TeamPermission"("teamId", "userId");
CREATE INDEX "TeamPermission_userId_idx" ON "TeamPermission"("userId");
CREATE INDEX "TeamPermission_teamId_role_idx" ON "TeamPermission"("teamId", "role");

ALTER TABLE "TeamPermission" ADD CONSTRAINT "TeamPermission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamPermission" ADD CONSTRAINT "TeamPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ScrimProposal" (
    "id" TEXT NOT NULL,
    "fromTeamId" TEXT NOT NULL,
    "toTeamId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "weekday" TEXT NOT NULL,
    "slot" "OfficialScrimSlot" NOT NULL,
    "status" "ScrimProposalStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ScrimProposal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScrimProposal_toTeamId_status_idx" ON "ScrimProposal"("toTeamId", "status");
CREATE INDEX "ScrimProposal_fromTeamId_status_idx" ON "ScrimProposal"("fromTeamId", "status");
CREATE INDEX "ScrimProposal_weekStartDate_weekday_slot_idx" ON "ScrimProposal"("weekStartDate", "weekday", "slot");
CREATE INDEX "ScrimProposal_createdById_idx" ON "ScrimProposal"("createdById");
CREATE UNIQUE INDEX "ScrimProposal_pending_unique" ON "ScrimProposal"("fromTeamId", "toTeamId", "weekStartDate", "weekday", "slot") WHERE "status" = 'PENDING';

ALTER TABLE "ScrimProposal" ADD CONSTRAINT "ScrimProposal_fromTeamId_fkey" FOREIGN KEY ("fromTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScrimProposal" ADD CONSTRAINT "ScrimProposal_toTeamId_fkey" FOREIGN KEY ("toTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScrimProposal" ADD CONSTRAINT "ScrimProposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OfficialSchedule" ADD COLUMN "matchSlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "OfficialSchedule"
SET "matchSlots" = ARRAY_REMOVE(ARRAY[
  CASE WHEN "monday" = 'SCRIM_20H' THEN 'monday:20' WHEN "monday" = 'SCRIM_21H' THEN 'monday:21' END,
  CASE WHEN "tuesday" = 'SCRIM_20H' THEN 'tuesday:20' WHEN "tuesday" = 'SCRIM_21H' THEN 'tuesday:21' END,
  CASE WHEN "wednesday" = 'SCRIM_20H' THEN 'wednesday:20' WHEN "wednesday" = 'SCRIM_21H' THEN 'wednesday:21' END,
  CASE WHEN "thursday" = 'SCRIM_20H' THEN 'thursday:20' WHEN "thursday" = 'SCRIM_21H' THEN 'thursday:21' END,
  CASE WHEN "friday" = 'SCRIM_20H' THEN 'friday:20' WHEN "friday" = 'SCRIM_21H' THEN 'friday:21' END,
  CASE WHEN "saturday" = 'SCRIM_20H' THEN 'saturday:20' WHEN "saturday" = 'SCRIM_21H' THEN 'saturday:21' END,
  CASE WHEN "sunday" = 'SCRIM_20H' THEN 'sunday:20' WHEN "sunday" = 'SCRIM_21H' THEN 'sunday:21' END
]::TEXT[], NULL);

CREATE INDEX "OfficialSchedule_matchSlots_idx" ON "OfficialSchedule" USING GIN ("matchSlots");

INSERT INTO "TeamPermission" ("id", "teamId", "userId", "role", "canEditOfficialSchedule", "canRecordScrim", "canProposeScrim", "createdAt", "updatedAt")
SELECT
  'perm_' || "teamId" || '_' || "userId",
  "teamId",
  "userId",
  'COACH'::"TeamGrantRole",
  true,
  true,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "TeamCoach"
ON CONFLICT ("teamId", "userId") DO NOTHING;
