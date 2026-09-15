-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('LOOKING', 'NOT_LOOKING');

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN "recruitmentStatus" "RecruitmentStatus" NOT NULL DEFAULT 'LOOKING';
