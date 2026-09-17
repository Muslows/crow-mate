import type { DayAvailability, OfficialScrimSlot, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canViewTeamInternal } from "@/lib/access";
import { daysFromRecord, EMPTY_WEEK, officialSlotMeta } from "@/lib/availability";
import { matchSlotsFromDays, type MatchableOfficialSlot } from "@/lib/scrim-slots";
import { isoToUtcDate, WEEKDAY_KEYS, weekStartForOffset, type WeekdayKey } from "@/lib/week";
import { calculateWeekScrimSuggestions } from "@/lib/scrim-suggestion";

export type OfficialDayMap = Record<WeekdayKey, OfficialScrimSlot>;
export type WeekDayMap = Record<WeekdayKey, DayAvailability>;

export const EMPTY_OFFICIAL_WEEK: OfficialDayMap = {
  monday: "NONE",
  tuesday: "NONE",
  wednesday: "NONE",
  thursday: "NONE",
  friday: "NONE",
  saturday: "NONE",
  sunday: "NONE",
};

export const EMPTY_OFFICIAL_NOTES: Record<WeekdayKey, string> = {
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
  sunday: "",
};

function toOfficialMap(row: {
  monday: OfficialScrimSlot;
  tuesday: OfficialScrimSlot;
  wednesday: OfficialScrimSlot;
  thursday: OfficialScrimSlot;
  friday: OfficialScrimSlot;
  saturday: OfficialScrimSlot;
  sunday: OfficialScrimSlot;
}): OfficialDayMap {
  return {
    monday: row.monday,
    tuesday: row.tuesday,
    wednesday: row.wednesday,
    thursday: row.thursday,
    friday: row.friday,
    saturday: row.saturday,
    sunday: row.sunday,
  };
}

function toOfficialNotes(row: {
  mondayNote: string;
  tuesdayNote: string;
  wednesdayNote: string;
  thursdayNote: string;
  fridayNote: string;
  saturdayNote: string;
  sundayNote: string;
}): Record<WeekdayKey, string> {
  return {
    monday: row.mondayNote,
    tuesday: row.tuesdayNote,
    wednesday: row.wednesdayNote,
    thursday: row.thursdayNote,
    friday: row.fridayNote,
    saturday: row.saturdayNote,
    sunday: row.sundayNote,
  };
}

function toDayMap(row: {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}): WeekDayMap {
  return daysFromRecord({
    monday: row.monday,
    tuesday: row.tuesday,
    wednesday: row.wednesday,
    thursday: row.thursday,
    friday: row.friday,
    saturday: row.saturday,
    sunday: row.sunday,
  });
}

export async function getWeeklyAvailability(
  playerId: string,
  weekStartIso: string,
) {
  return db.weeklyAvailability.findUnique({
    where: {
      playerId_weekStartDate: {
        playerId,
        weekStartDate: isoToUtcDate(weekStartIso),
      },
    },
  });
}

export async function resolvePlayerWeekDefaults(
  playerId: string,
  weekStartIso: string,
): Promise<{ days: WeekDayMap; saved: boolean; previousCopied: boolean }> {
  const current = await getWeeklyAvailability(playerId, weekStartIso);
  if (current) {
    return { days: toDayMap(current), saved: true, previousCopied: false };
  }

  const previous = await db.weeklyAvailability.findFirst({
    where: {
      playerId,
      weekStartDate: { lt: isoToUtcDate(weekStartIso) },
    },
    orderBy: { weekStartDate: "desc" },
  });

  if (previous) {
    return { days: toDayMap(previous), saved: false, previousCopied: true };
  }

  return { days: { ...EMPTY_WEEK }, saved: false, previousCopied: false };
}

export async function getAvailabilitiesForProfiles(
  playerIds: string[],
  weekStartIso: string,
) {
  if (playerIds.length === 0) return [];
  return db.weeklyAvailability.findMany({
    where: {
      playerId: { in: playerIds },
      weekStartDate: isoToUtcDate(weekStartIso),
    },
  });
}

export async function getTeamPlanningMatrix(
  teamId: string,
  weekStartIso: string,
  viewerId: string,
) {
  const allowed = await canViewTeamInternal(teamId, viewerId);
  if (!allowed) return null;

  const team = await db.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      managerId: true,
      org: { select: { tag: true } },
      players: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          battleTag: true,
          role: true,
          userId: true,
          user: {
            select: {
              name: true,
              playerProfile: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!team) return null;

  const profileIds = team.players.flatMap((player) =>
    player.user?.playerProfile?.id ? [player.user.playerProfile.id] : [],
  );
  const rows = await getAvailabilitiesForProfiles(profileIds, weekStartIso);
  const byProfile = new Map(
    rows.map((row) => [row.playerId, toDayMap(row)] as const),
  );

  const officialRow = await db.officialSchedule.findUnique({
    where: {
      teamId_weekStartDate: {
        teamId,
        weekStartDate: isoToUtcDate(weekStartIso),
      },
    },
  });

  const players = team.players.map((player) => {
    const profile = player.user?.playerProfile;
    const name =
      profile?.displayName?.trim() ||
      player.user?.name ||
      "Joueur";
    return {
      rosterId: player.id,
      profileId: profile?.id ?? null,
      name,
      role: player.role,
      days: profile ? (byProfile.get(profile.id) ?? null) : null,
    };
  });

  return {
    team,
    weekStartIso,
    players,
    suggestions: calculateWeekScrimSuggestions(players.map((player) => player.days)),
    official: officialRow ? toOfficialMap(officialRow) : { ...EMPTY_OFFICIAL_WEEK },
    officialNotes: officialRow
      ? toOfficialNotes(officialRow)
      : { ...EMPTY_OFFICIAL_NOTES },
  };
}

export async function canViewTeamPlanning(
  teamId: string,
  userId: string,
  _role?: string,
): Promise<boolean> {
  return canViewTeamInternal(teamId, userId);
}

export async function getOfficialSchedulesForTeams(
  teamIds: string[],
  weekStartIso: string,
) {
  if (teamIds.length === 0) return [];
  const rows = await db.officialSchedule.findMany({
    where: {
      teamId: { in: teamIds },
      weekStartDate: isoToUtcDate(weekStartIso),
    },
    include: {
      team: {
        select: { id: true, name: true, org: { select: { tag: true } } },
      },
    },
  });
  return rows.map((row) => ({
    team: row.team,
    days: toOfficialMap(row),
    notes: toOfficialNotes(row),
  }));
}

export async function hasSavedWeek(playerId: string, weekStartIso: string) {
  return db.weeklyAvailability
    .findUnique({
      where: {
        playerId_weekStartDate: {
          playerId,
          weekStartDate: isoToUtcDate(weekStartIso),
        },
      },
      select: { id: true },
    })
    .then((row) => Boolean(row));
}

export async function getTeamWeekHighlights(teamIds: string[]) {
  if (teamIds.length === 0) return new Map<string, string[]>();
  const weekStart = weekStartForOffset(0);
  const rows = await db.officialSchedule.findMany({
    where: {
      teamId: { in: teamIds },
      weekStartDate: isoToUtcDate(weekStart),
    },
  });
  const highlights = new Map<string, string[]>();
  for (const row of rows) {
    const notes = toOfficialNotes(row);
    const days = WEEKDAY_KEYS.map((key) => {
      const slot = row[key];
      if (slot === "NONE") return null;
      return officialSlotMeta(slot, notes[key]).label;
    }).filter((value): value is string => Boolean(value));
    highlights.set(row.teamId, days);
  }
  return highlights;
}

export async function applyOfficialMatchSlot(
  tx: Prisma.TransactionClient,
  teamId: string,
  weekStartIso: string,
  weekday: WeekdayKey,
  slot: MatchableOfficialSlot,
) {
  const weekStartDate = isoToUtcDate(weekStartIso);
  const existing = await tx.officialSchedule.findUnique({
    where: { teamId_weekStartDate: { teamId, weekStartDate } },
  });
  const days = existing ? toOfficialMap(existing) : { ...EMPTY_OFFICIAL_WEEK };
  const notes = existing ? toOfficialNotes(existing) : { ...EMPTY_OFFICIAL_NOTES };
  days[weekday] = slot;
  notes[weekday] = "";
  const payload = {
    ...days,
    mondayNote: notes.monday,
    tuesdayNote: notes.tuesday,
    wednesdayNote: notes.wednesday,
    thursdayNote: notes.thursday,
    fridayNote: notes.friday,
    saturdayNote: notes.saturday,
    sundayNote: notes.sunday,
    matchSlots: matchSlotsFromDays(days),
  };
  await tx.officialSchedule.upsert({
    where: { teamId_weekStartDate: { teamId, weekStartDate } },
    create: { teamId, weekStartDate, ...payload },
    update: payload,
  });
}



