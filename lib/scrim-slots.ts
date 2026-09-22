import type { OfficialScrimSlot } from "@prisma/client";
import {
  parseWindowKey,
  rangesOverlap,
  windowKey,
  type ClockRange,
} from "@/lib/time-slots";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export const MATCHABLE_OFFICIAL_SLOTS = ["SCRIM_20H", "SCRIM_21H"] as const;

export type MatchableOfficialSlot = (typeof MATCHABLE_OFFICIAL_SLOTS)[number];
export type MatchHour = "20" | "21";
export type MatchSlotKey = `${WeekdayKey}:${string}`;

export type OfficialDayMap = Record<WeekdayKey, OfficialScrimSlot>;

const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

const LEGACY_WINDOWS: Record<MatchableOfficialSlot, ClockRange> = {
  SCRIM_20H: { startMinutes: 20 * 60, endMinutes: 22 * 60 },
  SCRIM_21H: { startMinutes: 21 * 60, endMinutes: 23 * 60 },
};

export function isMatchableSlot(
  value: OfficialScrimSlot,
): value is MatchableOfficialSlot {
  return value === "SCRIM_20H" || value === "SCRIM_21H";
}

export function hourFromSlot(slot: MatchableOfficialSlot): MatchHour {
  return slot === "SCRIM_20H" ? "20" : "21";
}

export function slotFromHour(hour: MatchHour): MatchableOfficialSlot {
  return hour === "20" ? "SCRIM_20H" : "SCRIM_21H";
}

export function slotFromWindowStart(startMinutes: number): MatchableOfficialSlot {
  return startMinutes < 21 * 60 ? "SCRIM_20H" : "SCRIM_21H";
}

export function encodeMatchSlot(
  weekday: WeekdayKey,
  slot: MatchableOfficialSlot,
): MatchSlotKey {
  const range = LEGACY_WINDOWS[slot];
  return `${weekday}:${windowKey(range.startMinutes, range.endMinutes)}`;
}

export function encodeWindowSlot(
  weekday: WeekdayKey,
  startMinutes: number,
  endMinutes: number,
): MatchSlotKey {
  return `${weekday}:${windowKey(startMinutes, endMinutes)}`;
}

export function parseMatchSlot(value: string): {
  weekday: WeekdayKey;
  slot: MatchableOfficialSlot;
  startMinutes: number;
  endMinutes: number;
} | null {
  const [weekday, rest] = value.split(":");
  if (!WEEKDAY_KEYS.includes(weekday as WeekdayKey) || !rest) return null;
  const day = weekday as WeekdayKey;
  if (rest === "20" || rest === "21") {
    const slot = slotFromHour(rest);
    const range = LEGACY_WINDOWS[slot];
    return {
      weekday: day,
      slot,
      startMinutes: range.startMinutes,
      endMinutes: range.endMinutes,
    };
  }
  const range = parseWindowKey(rest);
  if (!range) return null;
  return {
    weekday: day,
    slot: slotFromWindowStart(range.startMinutes),
    startMinutes: range.startMinutes,
    endMinutes: range.endMinutes,
  };
}

export function matchSlotsFromDays(days: OfficialDayMap): MatchSlotKey[] {
  return WEEKDAY_KEYS.flatMap((key) => {
    const slot = days[key];
    return isMatchableSlot(slot) ? [encodeMatchSlot(key, slot)] : [];
  });
}

export function commonMatchSlots(
  ours: readonly string[],
  theirs: readonly string[],
): MatchSlotKey[] {
  const parsedTheirs = theirs
    .map(parseMatchSlot)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const seen = new Set<string>();
  const result: MatchSlotKey[] = [];
  for (const oursKey of ours) {
    const left = parseMatchSlot(oursKey);
    if (!left) continue;
    const overlap = parsedTheirs.some(
      (right) =>
        right.weekday === left.weekday &&
        rangesOverlap(
          {
            startMinutes: left.startMinutes,
            endMinutes: left.endMinutes,
          },
          {
            startMinutes: right.startMinutes,
            endMinutes: right.endMinutes,
          },
        ),
    );
    if (!overlap) continue;
    if (seen.has(oursKey)) continue;
    seen.add(oursKey);
    result.push(oursKey as MatchSlotKey);
  }
  return result;
}

export function formatMatchSlot(value: string): string {
  const parsed = parseMatchSlot(value);
  if (!parsed) return value;
  const startH = Math.floor(parsed.startMinutes / 60);
  const endH = Math.floor(parsed.endMinutes / 60) % 24;
  return `${WEEKDAY_LABELS[parsed.weekday]} ${startH}h – ${endH}h`;
}

export function formatMatchSlotPhrase(value: string): string {
  const parsed = parseMatchSlot(value);
  if (!parsed) return value;
  const startH = Math.floor(parsed.startMinutes / 60);
  const endH = Math.floor(parsed.endMinutes / 60) % 24;
  return `le ${WEEKDAY_LABELS[parsed.weekday]} de ${startH}h à ${endH}h`;
}

export function srBand(estimatedSr: number, tolerance: number) {
  const spread = Math.min(500, Math.max(0, Math.trunc(tolerance)));
  return {
    min: Math.max(0, estimatedSr - spread),
    max: Math.min(5000, estimatedSr + spread),
  };
}

export function isValidTolerance(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 500;
}
