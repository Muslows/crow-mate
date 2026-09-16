ALTER TABLE "PlayerProfile" ADD COLUMN "battleTagPublic" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "ScrimMapOutcome" AS ENUM ('WIN', 'LOSS');

CREATE TABLE "Scrim" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "opponentName" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scrim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScrimMapResult" (
    "id" TEXT NOT NULL,
    "scrimId" TEXT NOT NULL,
    "mapName" TEXT NOT NULL,
    "outcome" "ScrimMapOutcome" NOT NULL,
    "intensity" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ScrimMapResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Scrim_teamId_playedAt_idx" ON "Scrim"("teamId", "playedAt");
CREATE INDEX "Scrim_createdById_idx" ON "Scrim"("createdById");
CREATE INDEX "ScrimMapResult_scrimId_sortOrder_idx" ON "ScrimMapResult"("scrimId", "sortOrder");

ALTER TABLE "Scrim" ADD CONSTRAINT "Scrim_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Scrim" ADD CONSTRAINT "Scrim_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ScrimMapResult" ADD CONSTRAINT "ScrimMapResult_scrimId_fkey" FOREIGN KEY ("scrimId") REFERENCES "Scrim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
