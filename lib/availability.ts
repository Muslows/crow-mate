import type { OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export type DaySlotMap = Record<WeekdayKey, string[]>;

export const WEEKDAY_SLOT_FIELDS = {
  monday: "mondaySlots",
  tuesday: "tuesdaySlots",
  wednesday: "wednesdaySlots",
  thursday: "thursdaySlots",
  friday: "fridaySlots",
  saturday: "saturdaySlots",
  sunday: "sundaySlots",
} as const satisfies Record<WeekdayKey, string>;

export const EMPTY_WEEK: DaySlotMap = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export function daysFromSlotRecord(record: DaySlotMap): DaySlotMap {
  return WEEKDAY_KEYS.reduce(
    (acc, key) => {
      acc[key] = [...(record[key] ?? [])];
      return acc;
    },
    { ...EMPTY_WEEK },
  );
}

export const OFFICIAL_SCRIM_SLOTS = [
  { value: "NONE", label: "Aucun" },
  { value: "SCRIM_20H", label: "Scrim 20h" },
  { value: "SCRIM_21H", label: "Scrim 21h" },
  { value: "VOD_REVIEW", label: "VOD Review" },
  { value: "TOURNOI", label: "Tournoi" },
  { value: "CUSTOM", label: "Autre / Custom" },
  { value: "TBD", label: "À déterminer" },
] as const;

export function officialSlotMeta(
  value: OfficialScrimSlot,
  note = "",
) {
  const found = OFFICIAL_SCRIM_SLOTS.find((item) => item.value === value);
  const trimmed = note.trim();
  const label =
    value === "CUSTOM" && trimmed ? trimmed : (found?.label ?? value);
  const cellClass =
    value === "SCRIM_20H"
      ? "rounded-full border border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200"
      : value === "SCRIM_21H"
        ? "rounded-full border border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200"
        : value === "VOD_REVIEW"
          ? "rounded-full border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
          : value === "TOURNOI"
            ? "rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
            : value === "CUSTOM"
              ? "rounded-full border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-200"
              : value === "TBD"
                ? "rounded-full border border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200"
                : "rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400";
  return { label, cellClass };
}
