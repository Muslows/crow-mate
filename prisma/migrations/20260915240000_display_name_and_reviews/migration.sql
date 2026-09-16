-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN "displayName" TEXT NOT NULL DEFAULT '';

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "PlayerProfile_displayName_trgm" ON "PlayerProfile" USING GIN ("displayName" gin_trgm_ops);

-- CreateEnum
CREATE TYPE "TeamReviewRating" AS ENUM ('GOOD', 'AVERAGE', 'AVOID');

-- CreateTable
CREATE TABLE "TeamReview" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" "TeamReviewRating" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamReview_teamId_reviewerId_key" ON "TeamReview"("teamId", "reviewerId");
CREATE INDEX "TeamReview_teamId_idx" ON "TeamReview"("teamId");
CREATE INDEX "TeamReview_reviewerId_idx" ON "TeamReview"("reviewerId");

ALTER TABLE "TeamReview" ADD CONSTRAINT "TeamReview_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamReview" ADD CONSTRAINT "TeamReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
