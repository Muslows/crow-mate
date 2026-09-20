ALTER TABLE "Team"
DROP COLUMN "scrimChannelId",
DROP COLUMN "playerChannelId",
DROP COLUMN "teamChannelId",
DROP COLUMN "subChannelId";

CREATE TABLE "DiscordBroadcastHub" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "guildName" TEXT NOT NULL DEFAULT '',
    "scrimChannelId" TEXT NOT NULL DEFAULT '',
    "playerChannelId" TEXT NOT NULL DEFAULT '',
    "teamChannelId" TEXT NOT NULL DEFAULT '',
    "subChannelId" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscordBroadcastHub_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DiscordBroadcastHub_guildId_key" ON "DiscordBroadcastHub"("guildId");
