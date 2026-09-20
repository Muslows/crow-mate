import type { OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export const MATCHABLE_OFFICIAL_SLOTS = ["SCRIM_20H", "SCRIM_21H"] as const;

export type MatchableOfficialSlot = (typeof MATCHABLE_OFFICIAL_SLOTS)[number];
export type MatchHour = "20" | "21";
export type MatchSlotKey = `${WeekdayKey}:${MatchHour}`;

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

export function encodeMatchSlot(
  weekday: WeekdayKey,
  slot: MatchableOfficialSlot,
): MatchSlotKey {
  return `${weekday}:${hourFromSlot(slot)}`;
}

export function parseMatchSlot(value: string): {
  weekday: WeekdayKey;
  slot: MatchableOfficialSlot;
} | null {
  const [weekday, hour] = value.split(":");
  if (!WEEKDAY_KEYS.includes(weekday as WeekdayKey)) return null;
  if (hour !== "20" && hour !== "21") return null;
  return {
    weekday: weekday as WeekdayKey,
    slot: slotFromHour(hour),
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
  const lookup = new Set(theirs);
  return ours.filter((slot): slot is MatchSlotKey => lookup.has(slot));
}

export function formatMatchSlot(value: string): string {
  const parsed = parseMatchSlot(value);
  if (!parsed) return value;
  return `${WEEKDAY_LABELS[parsed.weekday]} ${hourFromSlot(parsed.slot)}h`;
}

export function formatMatchSlotPhrase(value: string): string {
  const parsed = parseMatchSlot(value);
  if (!parsed) return value;
  return `le ${WEEKDAY_LABELS[parsed.weekday]} à ${hourFromSlot(parsed.slot)}h`;
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
