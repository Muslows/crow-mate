import { db } from "@/lib/db";
import { isoToUtcDate } from "@/lib/week";
import {
  commonMatchSlots,
  formatMatchSlot,
  srBand,
  type MatchSlotKey,
} from "@/lib/scrim-slots";

export type ScrimMatchCandidate = {
  teamId: string;
  name: string;
  orgTag: string | null;
  estimatedSr: number;
  commonSlots: MatchSlotKey[];
  labels: string[];
};

export async function findScrimMatches(input: {
  teamId: string;
  weekStartIso: string;
  tolerance: number;
}): Promise<{
  estimatedSr: number;
  band: { min: number; max: number };
  ourSlots: MatchSlotKey[];
  matches: ScrimMatchCandidate[];
}> {
  const team = await db.team.findUnique({
    where: { id: input.teamId },
    select: { id: true, estimatedSr: true },
  });
  if (!team) {
    return {
      estimatedSr: 0,
      band: { min: 0, max: 0 },
      ourSlots: [],
      matches: [],
    };
  }

  const weekStartDate = isoToUtcDate(input.weekStartIso);
  const ours = await db.officialSchedule.findUnique({
    where: {
      teamId_weekStartDate: { teamId: team.id, weekStartDate },
    },
    select: { matchSlots: true },
  });
  const ourSlots = (ours?.matchSlots ?? []) as MatchSlotKey[];
  const band = srBand(team.estimatedSr, input.tolerance);

  if (ourSlots.length === 0 || team.estimatedSr <= 0) {
    return { estimatedSr: team.estimatedSr, band, ourSlots, matches: [] };
  }

  const rows = await db.officialSchedule.findMany({
    where: {
      weekStartDate,
      teamId: { not: team.id },
      team: {
        estimatedSr: { gte: band.min, lte: band.max },
      },
    },
    select: {
      matchSlots: true,
      team: {
        select: {
          id: true,
          name: true,
          estimatedSr: true,
          org: { select: { tag: true } },
        },
      },
    },
    take: 80,
  });

  const matches = rows
    .map((row) => {
      const commonSlots = commonMatchSlots(ourSlots, row.matchSlots);
      return {
        teamId: row.team.id,
        name: row.team.name,
        orgTag: row.team.org?.tag ?? null,
        estimatedSr: row.team.estimatedSr,
        commonSlots,
        labels: commonSlots.map(formatMatchSlot),
      };
    })
    .filter((row) => row.commonSlots.length > 0)
    .sort((left, right) => left.estimatedSr - right.estimatedSr);

  return { estimatedSr: team.estimatedSr, band, ourSlots, matches };
}
