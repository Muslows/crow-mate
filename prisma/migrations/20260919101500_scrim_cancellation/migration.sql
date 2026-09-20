ALTER TYPE "ScrimProposalStatus" ADD VALUE 'CANCELLED';

CREATE TYPE "ScrimCancellationReason" AS ENUM (
    'ROSTER_UNAVAILABLE',
    'TECHNICAL_ISSUE',
    'SCHEDULE_ERROR',
    'OTHER'
);

ALTER TABLE "ScrimProposal"
ADD COLUMN "cancellationReason" "ScrimCancellationReason",
ADD COLUMN "cancellationDetails" TEXT NOT NULL DEFAULT '',
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelledById" TEXT,
ADD COLUMN "cancelledByTeamId" TEXT;

CREATE INDEX "ScrimProposal_cancelledById_idx"
ON "ScrimProposal"("cancelledById");

CREATE INDEX "ScrimProposal_cancelledByTeamId_cancelledAt_idx"
ON "ScrimProposal"("cancelledByTeamId", "cancelledAt");

ALTER TABLE "ScrimProposal"
ADD CONSTRAINT "ScrimProposal_cancelledById_fkey"
FOREIGN KEY ("cancelledById") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ScrimProposal"
ADD CONSTRAINT "ScrimProposal_cancelledByTeamId_fkey"
FOREIGN KEY ("cancelledByTeamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
