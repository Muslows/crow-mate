ALTER TABLE "Team"
ADD COLUMN "scrimChannelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "playerChannelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "teamChannelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "subChannelId" TEXT NOT NULL DEFAULT '';

CREATE TYPE "AnnouncementType" AS ENUM ('SCRIM', 'PLAYER', 'TEAM', 'SUB');
CREATE TYPE "AnnouncementStatus" AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE "AnnouncementPostStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELETED');

CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "structureId" TEXT,
    "createdById" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL,
    "content" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "discordMessageId" TEXT NOT NULL DEFAULT '',
    "channelId" TEXT NOT NULL DEFAULT '',
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'ACTIVE',
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnnouncementPost" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "discordMessageId" TEXT NOT NULL DEFAULT '',
    "status" "AnnouncementPostStatus" NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnouncementPost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Announcement_status_expiresAt_idx" ON "Announcement"("status", "expiresAt");
CREATE INDEX "Announcement_type_status_expiresAt_idx" ON "Announcement"("type", "status", "expiresAt");
CREATE INDEX "Announcement_teamId_createdAt_idx" ON "Announcement"("teamId", "createdAt");
CREATE INDEX "Announcement_structureId_idx" ON "Announcement"("structureId");
CREATE UNIQUE INDEX "AnnouncementPost_announcementId_channelId_key" ON "AnnouncementPost"("announcementId", "channelId");
CREATE INDEX "AnnouncementPost_status_idx" ON "AnnouncementPost"("status");

ALTER TABLE "Announcement"
ADD CONSTRAINT "Announcement_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Announcement"
ADD CONSTRAINT "Announcement_structureId_fkey"
FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Announcement"
ADD CONSTRAINT "Announcement_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnnouncementPost"
ADD CONSTRAINT "AnnouncementPost_announcementId_fkey"
FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
