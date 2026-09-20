CREATE TYPE "ConversationContextType" AS ENUM ('DIRECT', 'RECRUITMENT', 'SCRIM');
CREATE TYPE "DiscordNotificationType" AS ENUM ('SCRIM_PROPOSAL', 'CHAT_MESSAGE', 'SCRIM_CANCELLED');
CREATE TYPE "NotificationOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

ALTER TABLE "user"
ADD COLUMN "deactivatedAt" TIMESTAMP(3),
ADD COLUMN "anonymizeAfter" TIMESTAMP(3),
ADD COLUMN "anonymizedAt" TIMESTAMP(3);

ALTER TABLE "Conversation"
ADD COLUMN "contextType" "ConversationContextType" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN "contextKey" TEXT NOT NULL DEFAULT 'direct',
ADD COLUMN "contextTeamId" TEXT,
ADD COLUMN "scrimProposalId" TEXT;

DROP INDEX "Conversation_recruiterId_candidateId_key";
CREATE UNIQUE INDEX "Conversation_recruiterId_candidateId_contextKey_key"
ON "Conversation"("recruiterId", "candidateId", "contextKey");
CREATE INDEX "Conversation_contextTeamId_idx" ON "Conversation"("contextTeamId");
CREATE INDEX "Conversation_scrimProposalId_idx" ON "Conversation"("scrimProposalId");

CREATE TABLE "TeamDiscordIntegration" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "guildId" TEXT NOT NULL,
  "guildName" TEXT NOT NULL DEFAULT '',
  "channelId" TEXT,
  "channelName" TEXT NOT NULL DEFAULT '',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "installedById" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "lastDeliveryAt" TIMESTAMP(3),
  "lastError" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamDiscordIntegration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationOutbox" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "type" "DiscordNotificationType" NOT NULL,
  "payload" JSONB NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "status" "NotificationOutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "lockToken" TEXT,
  "lastError" TEXT NOT NULL DEFAULT '',
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamDiscordIntegration_teamId_key" ON "TeamDiscordIntegration"("teamId");
CREATE INDEX "TeamDiscordIntegration_guildId_idx" ON "TeamDiscordIntegration"("guildId");
CREATE INDEX "TeamDiscordIntegration_installedById_idx" ON "TeamDiscordIntegration"("installedById");
CREATE UNIQUE INDEX "NotificationOutbox_dedupeKey_key" ON "NotificationOutbox"("dedupeKey");
CREATE INDEX "NotificationOutbox_status_nextAttemptAt_idx" ON "NotificationOutbox"("status", "nextAttemptAt");
CREATE INDEX "NotificationOutbox_teamId_createdAt_idx" ON "NotificationOutbox"("teamId", "createdAt");
CREATE INDEX "NotificationOutbox_lockToken_idx" ON "NotificationOutbox"("lockToken");

ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_contextTeamId_fkey"
FOREIGN KEY ("contextTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_scrimProposalId_fkey"
FOREIGN KEY ("scrimProposalId") REFERENCES "ScrimProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamDiscordIntegration"
ADD CONSTRAINT "TeamDiscordIntegration_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamDiscordIntegration"
ADD CONSTRAINT "TeamDiscordIntegration_installedById_fkey"
FOREIGN KEY ("installedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NotificationOutbox"
ADD CONSTRAINT "NotificationOutbox_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
