-- Convert centralized hubs into per-guild slash-command config.
CREATE TABLE "DiscordServerConfig" (
    "guildId" TEXT NOT NULL,
    "scrimChannelId" TEXT NOT NULL,
    "guildName" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordServerConfig_pkey" PRIMARY KEY ("guildId")
);

INSERT INTO "DiscordServerConfig" ("guildId", "scrimChannelId", "guildName", "updatedAt", "createdAt")
SELECT "guildId", "scrimChannelId", "guildName", CURRENT_TIMESTAMP, "createdAt"
FROM "DiscordBroadcastHub"
WHERE "scrimChannelId" <> ''
ON CONFLICT ("guildId") DO NOTHING;

DROP TABLE "DiscordBroadcastHub";

ALTER TABLE "Announcement"
ADD COLUMN "discordMessageIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "AnnouncementPost"
ADD COLUMN "guildId" TEXT NOT NULL DEFAULT '';
