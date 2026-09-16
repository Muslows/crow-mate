CREATE TYPE "OpponentBehavior" AS ENUM ('COURTOIS', 'BON', 'PEU_AGREABLE', 'TOXIQUE_OU_TROLL');

ALTER TABLE "Scrim" ADD COLUMN "opponentSrInput" INTEGER;
ALTER TABLE "Scrim" ADD COLUMN "opponentBehavior" "OpponentBehavior" NOT NULL DEFAULT 'BON';

CREATE INDEX "Scrim_opponentBehavior_idx" ON "Scrim"("opponentBehavior");

DROP TABLE IF EXISTS "TeamReview";
DROP TYPE IF EXISTS "TeamReviewRating";
