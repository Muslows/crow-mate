import type { DayAvailability, OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export const DAY_AVAILABILITIES = [
  {
    value: "DISPO_20H",
    label: "20h",
    hint: "Disponible à partir de 20h",
    cellClass: "text-emerald-700 dark:text-emerald-300",
    chipClass:
      "rounded-full border-emerald-200 bg-emerald-50 text-emerald-800 transition-colors duration-200 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 data-[checked=true]:ring-2 data-[checked=true]:ring-emerald-400 dark:data-[checked=true]:ring-emerald-300",
  },
  {
    value: "DISPO_21H",
    label: "21h",
    hint: "Disponible à partir de 21h",
    cellClass: "text-sky-700 dark:text-sky-300",
    chipClass:
      "rounded-full border-sky-200 bg-sky-50 text-sky-800 transition-colors duration-200 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200 data-[checked=true]:ring-2 data-[checked=true]:ring-sky-400 dark:data-[checked=true]:ring-sky-300",
  },
  {
    value: "INCERTAIN",
    label: "Incertain",
    hint: "Pas sûr d'être disponible",
    cellClass: "text-amber-700 dark:text-amber-300",
    chipClass:
      "rounded-full border-amber-200 bg-amber-50 text-amber-800 transition-colors duration-200 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 data-[checked=true]:ring-2 data-[checked=true]:ring-amber-400 dark:data-[checked=true]:ring-amber-300",
  },
  {
    value: "INDISPO",
    label: "Indispo",
    hint: "Indisponible",
    cellClass: "text-zinc-600 dark:text-zinc-400",
    chipClass:
      "rounded-full border-zinc-300 bg-zinc-100 text-zinc-700 transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 data-[checked=true]:ring-2 data-[checked=true]:ring-zinc-400 dark:data-[checked=true]:ring-zinc-300",
  },
] as const;

export type DayAvailabilityValue = (typeof DAY_AVAILABILITIES)[number]["value"];

export const EMPTY_WEEK: Record<WeekdayKey, DayAvailability> = {
  monday: "INDISPO",
  tuesday: "INDISPO",
  wednesday: "INDISPO",
  thursday: "INDISPO",
  friday: "INDISPO",
  saturday: "INDISPO",
  sunday: "INDISPO",
};

export function availabilityMeta(value: DayAvailability | null) {
  if (!value) {
    return {
      value: null,
      label: "—",
      hint: "Non renseigné",
      cellClass: "text-zinc-500 dark:text-zinc-400",
      chipClass:
        "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400",
    };
  }
  return DAY_AVAILABILITIES.find((item) => item.value === value) ?? DAY_AVAILABILITIES[3];
}

export function daysFromRecord(record: Record<WeekdayKey, DayAvailability>) {
  return WEEKDAY_KEYS.reduce(
    (acc, key) => {
      acc[key] = record[key];
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
      ? "rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
      : value === "SCRIM_21H"
        ? "rounded-full border border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
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
