-- CreateEnum
CREATE TYPE "TeamFormat" AS ENUM ('STANDARD_5V5', 'CUSTOM');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "format" "TeamFormat" NOT NULL DEFAULT 'STANDARD_5V5';

-- AlterTable
ALTER TABLE "DiscordServerConfig" ADD COLUMN IF NOT EXISTS "playerChannelId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DiscordServerConfig" ADD COLUMN IF NOT EXISTS "teamChannelId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DiscordServerConfig" ADD COLUMN IF NOT EXISTS "ringerChannelId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DiscordServerConfig" ALTER COLUMN "scrimChannelId" SET DEFAULT '';

-- AlterEnum
ALTER TYPE "AnnouncementPostStatus" ADD VALUE 'SENDING';
