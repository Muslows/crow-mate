ALTER TYPE "Structure" RENAME TO "LegalForm";

CREATE TABLE "Structure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "logoUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Structure_tag_key" ON "Structure"("tag");
CREATE INDEX "Structure_ownerId_idx" ON "Structure"("ownerId");

ALTER TABLE "Structure" ADD CONSTRAINT "Structure_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Team" ADD COLUMN "orgId" TEXT;
CREATE INDEX "Team_orgId_idx" ON "Team"("orgId");
ALTER TABLE "Team" ADD CONSTRAINT "Team_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "Player" SET "rankDivision" = 'UNRANKED' WHERE "sr" <= 0;
UPDATE "Player" SET "rankDivision" = 'BRONZE' WHERE "sr" >= 1 AND "sr" < 1500;
UPDATE "Player" SET "rankDivision" = 'SILVER' WHERE "sr" >= 1500 AND "sr" < 2000;
UPDATE "Player" SET "rankDivision" = 'GOLD' WHERE "sr" >= 2000 AND "sr" < 2500;
UPDATE "Player" SET "rankDivision" = 'PLATINUM' WHERE "sr" >= 2500 AND "sr" < 3000;
UPDATE "Player" SET "rankDivision" = 'EMERALD' WHERE "sr" >= 3000 AND "sr" < 3500;
UPDATE "Player" SET "rankDivision" = 'DIAMOND' WHERE "sr" >= 3500 AND "sr" < 4000;
UPDATE "Player" SET "rankDivision" = 'MASTER' WHERE "sr" >= 4000 AND "sr" < 4500;
UPDATE "Player" SET "rankDivision" = 'GRANDMASTER' WHERE "sr" >= 4500 AND "sr" < 5000;
UPDATE "Player" SET "rankDivision" = 'CHAMPION' WHERE "sr" >= 5000;
