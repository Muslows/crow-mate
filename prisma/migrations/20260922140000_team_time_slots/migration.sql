CREATE TABLE IF NOT EXISTS "TeamTimeSlot" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamTimeSlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TeamTimeSlot_teamId_sortOrder_idx" ON "TeamTimeSlot"("teamId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "TeamTimeSlot" ADD CONSTRAINT "TeamTimeSlot_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "TeamTimeSlot" ("id", "teamId", "label", "startTime", "endTime", "sortOrder")
SELECT 'tts20_' || t."id", t."id", '20h - 22h', '20:00', '22:00', 0
FROM "Team" t
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "TeamTimeSlot" ("id", "teamId", "label", "startTime", "endTime", "sortOrder")
SELECT 'tts21_' || t."id", t."id", '21h - 23h', '21:00', '23:00', 1
FROM "Team" t
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "mondaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "tuesdaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "wednesdaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "thursdaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "fridaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "saturdaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WeeklyAvailability" ADD COLUMN IF NOT EXISTS "sundaySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'WeeklyAvailability' AND column_name = 'monday'
  ) THEN
    UPDATE "WeeklyAvailability" wa SET
      "mondaySlots" = CASE wa.monday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END,
      "tuesdaySlots" = CASE wa.tuesday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END,
      "wednesdaySlots" = CASE wa.wednesday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END,
      "thursdaySlots" = CASE wa.thursday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END,
      "fridaySlots" = CASE wa.friday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END,
      "saturdaySlots" = CASE wa.saturday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END,
      "sundaySlots" = CASE wa.sunday
        WHEN 'DISPO_20H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '20:00')
        WHEN 'DISPO_21H' THEN ARRAY(SELECT s."id" FROM "TeamTimeSlot" s JOIN "PlayerProfile" p ON p."id" = wa."playerId" JOIN "Player" pl ON pl."userId" = p."userId" WHERE pl."teamId" = s."teamId" AND s."startTime" = '21:00')
        ELSE ARRAY[]::TEXT[]
      END;
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "monday";
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "tuesday";
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "wednesday";
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "thursday";
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "friday";
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "saturday";
    ALTER TABLE "WeeklyAvailability" DROP COLUMN "sunday";
  END IF;
END $$;
