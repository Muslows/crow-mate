-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COACH';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CASTER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'PLAYER';
ALTER TABLE "user" ALTER COLUMN "isPlayer" SET DEFAULT true;
ALTER TABLE "user" ADD COLUMN "isCoach" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isCaster" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isStaff" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CasterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamUrl" TEXT NOT NULL DEFAULT '',
    "vodUrl" TEXT NOT NULL DEFAULT '',
    "eventsNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CasterProfile_userId_key" ON "CasterProfile"("userId");
CREATE UNIQUE INDEX "Conversation_recruiterId_candidateId_key" ON "Conversation"("recruiterId", "candidateId");
CREATE INDEX "Conversation_recruiterId_updatedAt_idx" ON "Conversation"("recruiterId", "updatedAt");
CREATE INDEX "Conversation_candidateId_updatedAt_idx" ON "Conversation"("candidateId", "updatedAt");
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

ALTER TABLE "CasterProfile" ADD CONSTRAINT "CasterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
