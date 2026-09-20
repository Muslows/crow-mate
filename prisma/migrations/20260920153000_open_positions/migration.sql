-- CreateEnum
ALTER TYPE "ConversationContextType" ADD VALUE 'OPEN_POSITION';
ALTER TYPE "AnnouncementType" ADD VALUE 'LFP';

-- CreateTable
CREATE TABLE "OpenPosition" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "PlayerRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenPosition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OpenPositionApplication" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenPositionApplication_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "openPositionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OpenPosition_teamId_role_key" ON "OpenPosition"("teamId", "role");
CREATE INDEX "OpenPosition_teamId_createdAt_idx" ON "OpenPosition"("teamId", "createdAt");
CREATE INDEX "OpenPosition_role_idx" ON "OpenPosition"("role");
CREATE UNIQUE INDEX "OpenPositionApplication_positionId_playerId_key" ON "OpenPositionApplication"("positionId", "playerId");
CREATE INDEX "OpenPositionApplication_playerId_createdAt_idx" ON "OpenPositionApplication"("playerId", "createdAt");
CREATE INDEX "Announcement_openPositionId_idx" ON "Announcement"("openPositionId");
CREATE INDEX "PlayerProfile_sr_role_idx" ON "PlayerProfile"("sr", "role");
CREATE INDEX "PlayerProfile_languages_idx" ON "PlayerProfile" USING GIN ("languages");
CREATE INDEX "PlayerProfile_openToPlay_idx" ON "PlayerProfile" USING GIN ("openToPlay");

-- AddForeignKey
ALTER TABLE "OpenPosition" ADD CONSTRAINT "OpenPosition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpenPositionApplication" ADD CONSTRAINT "OpenPositionApplication_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "OpenPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpenPositionApplication" ADD CONSTRAINT "OpenPositionApplication_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_openPositionId_fkey" FOREIGN KEY ("openPositionId") REFERENCES "OpenPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
