-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
UPDATE "ChatMessage" SET "isRead" = true;
CREATE INDEX "ChatMessage_conversationId_isRead_idx" ON "ChatMessage"("conversationId", "isRead");
CREATE INDEX "ChatMessage_isRead_senderId_idx" ON "ChatMessage"("isRead", "senderId");

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('TOXIC', 'FAKE_PROFILE', 'WRONG_BATTLETAG', 'OTHER');
CREATE TYPE "ReportTargetType" AS ENUM ('PLAYER', 'TEAM');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "targetUserId" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");
CREATE INDEX "Report_targetUserId_idx" ON "Report"("targetUserId");
CREATE INDEX "Report_teamId_idx" ON "Report"("teamId");

ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
