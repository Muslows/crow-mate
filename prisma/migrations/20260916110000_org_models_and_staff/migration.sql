ALTER TABLE "StructureInvitation" ADD COLUMN "requestedByTeam" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Team" ADD COLUMN "parentTeamId" TEXT;
CREATE INDEX "Team_parentTeamId_idx" ON "Team"("parentTeamId");
ALTER TABLE "Team" ADD CONSTRAINT "Team_parentTeamId_fkey" FOREIGN KEY ("parentTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "StaffRole" AS ENUM ('COACH', 'ASSISTANT_COACH', 'ANALYST');

CREATE TABLE "ClubInvitation" (
    "id" TEXT NOT NULL,
    "parentTeamId" TEXT NOT NULL,
    "childTeamId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ClubInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClubInvitation_parentTeamId_childTeamId_key" ON "ClubInvitation"("parentTeamId", "childTeamId");
CREATE INDEX "ClubInvitation_parentTeamId_status_idx" ON "ClubInvitation"("parentTeamId", "status");
CREATE INDEX "ClubInvitation_childTeamId_status_idx" ON "ClubInvitation"("childTeamId", "status");

ALTER TABLE "ClubInvitation" ADD CONSTRAINT "ClubInvitation_parentTeamId_fkey" FOREIGN KEY ("parentTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubInvitation" ADD CONSTRAINT "ClubInvitation_childTeamId_fkey" FOREIGN KEY ("childTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubInvitation" ADD CONSTRAINT "ClubInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "StructureStaff" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureStaff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StructureStaff_structureId_userId_key" ON "StructureStaff"("structureId", "userId");
CREATE INDEX "StructureStaff_userId_idx" ON "StructureStaff"("userId");
CREATE INDEX "StructureStaff_structureId_role_idx" ON "StructureStaff"("structureId", "role");

ALTER TABLE "StructureStaff" ADD CONSTRAINT "StructureStaff_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StructureStaff" ADD CONSTRAINT "StructureStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
