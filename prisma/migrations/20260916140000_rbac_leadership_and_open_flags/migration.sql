CREATE TYPE "OpenFlag" AS ENUM ('CLOSED', 'OPEN');
CREATE TYPE "TeamLeadership" AS ENUM ('MANAGER', 'CAPTAIN');
CREATE TYPE "TeamSeatKind" AS ENUM ('PRIMARY', 'CO_MANAGER');
CREATE TYPE "InvitationKind" AS ENUM ('PLAYER', 'COACH');

ALTER TABLE "user" ADD COLUMN "openToCast" "OpenFlag" NOT NULL DEFAULT 'CLOSED';
ALTER TABLE "user" ADD COLUMN "openToCoach" "OpenFlag" NOT NULL DEFAULT 'CLOSED';

ALTER TABLE "Team" ADD COLUMN "leadership" "TeamLeadership" NOT NULL DEFAULT 'MANAGER';
ALTER TABLE "TeamInvitation" ADD COLUMN "kind" "InvitationKind" NOT NULL DEFAULT 'PLAYER';

CREATE TABLE "TeamSeat" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "TeamSeatKind" NOT NULL DEFAULT 'PRIMARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamSeat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamCoach" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamCoach_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamSeat_teamId_userId_key" ON "TeamSeat"("teamId", "userId");
CREATE INDEX "TeamSeat_userId_idx" ON "TeamSeat"("userId");
CREATE INDEX "TeamSeat_teamId_kind_idx" ON "TeamSeat"("teamId", "kind");
CREATE UNIQUE INDEX "TeamCoach_teamId_userId_key" ON "TeamCoach"("teamId", "userId");
CREATE INDEX "TeamCoach_userId_idx" ON "TeamCoach"("userId");

ALTER TABLE "TeamSeat" ADD CONSTRAINT "TeamSeat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamSeat" ADD CONSTRAINT "TeamSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamCoach" ADD CONSTRAINT "TeamCoach_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamCoach" ADD CONSTRAINT "TeamCoach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "TeamSeat" ("id", "teamId", "userId", "kind", "createdAt")
SELECT 'ts_' || "id", "id", "managerId", 'PRIMARY', CURRENT_TIMESTAMP
FROM "Team";
