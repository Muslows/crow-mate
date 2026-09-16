-- Recalculate stored roster ranks after the competitive SR scale shift.
UPDATE "Player" SET "rankDivision" = 'BRONZE' WHERE "sr" >= 0 AND "sr" < 1000;
UPDATE "Player" SET "rankDivision" = 'SILVER' WHERE "sr" >= 1000 AND "sr" < 1500;
UPDATE "Player" SET "rankDivision" = 'GOLD' WHERE "sr" >= 1500 AND "sr" < 2000;
UPDATE "Player" SET "rankDivision" = 'PLATINUM' WHERE "sr" >= 2000 AND "sr" < 2500;
UPDATE "Player" SET "rankDivision" = 'EMERALD' WHERE "sr" >= 2500 AND "sr" < 3000;
UPDATE "Player" SET "rankDivision" = 'DIAMOND' WHERE "sr" >= 3000 AND "sr" < 3500;
UPDATE "Player" SET "rankDivision" = 'MASTER' WHERE "sr" >= 3500 AND "sr" < 4000;
UPDATE "Player" SET "rankDivision" = 'GRANDMASTER' WHERE "sr" >= 4000 AND "sr" < 4500;
UPDATE "Player" SET "rankDivision" = 'CHAMPION' WHERE "sr" >= 4500;

CREATE TABLE "StructureInvitation" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "StructureInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StructureInvitation_structureId_teamId_key" ON "StructureInvitation"("structureId", "teamId");
CREATE INDEX "StructureInvitation_teamId_status_idx" ON "StructureInvitation"("teamId", "status");
CREATE INDEX "StructureInvitation_structureId_status_idx" ON "StructureInvitation"("structureId", "status");

ALTER TABLE "StructureInvitation" ADD CONSTRAINT "StructureInvitation_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StructureInvitation" ADD CONSTRAINT "StructureInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StructureInvitation" ADD CONSTRAINT "StructureInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
