import type { DayAvailability, OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export const DAY_AVAILABILITIES = [
  {
    value: "DISPO_20H",
    label: "20h",
    hint: "Disponible à partir de 20h",
    cellClass: "text-emerald-700",
    chipClass:
      "rounded-full border-emerald-800 bg-emerald-950/50 text-emerald-200 transition data-[checked=true]:ring-2 data-[checked=true]:ring-emerald-300",
  },
  {
    value: "DISPO_21H",
    label: "21h",
    hint: "Disponible à partir de 21h",
    cellClass: "text-sky-700",
    chipClass:
      "rounded-full border-sky-800 bg-sky-950/50 text-sky-200 transition data-[checked=true]:ring-2 data-[checked=true]:ring-sky-300",
  },
  {
    value: "INCERTAIN",
    label: "Incertain",
    hint: "Pas sûr d'être disponible",
    cellClass: "text-amber-700",
    chipClass:
      "rounded-full border-amber-800 bg-amber-950/50 text-amber-200 transition data-[checked=true]:ring-2 data-[checked=true]:ring-amber-300",
  },
  {
    value: "INDISPO",
    label: "Indispo",
    hint: "Indisponible",
    cellClass: "text-zinc-500",
    chipClass:
      "rounded-full border-zinc-800 bg-zinc-800 text-zinc-400 transition data-[checked=true]:ring-2 data-[checked=true]:ring-zinc-300",
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
      cellClass: "text-zinc-400",
      chipClass: "border-zinc-800 bg-zinc-800/50 text-zinc-400",
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
      ? "rounded-full border border-emerald-800 bg-emerald-950/50 text-emerald-200"
      : value === "SCRIM_21H"
        ? "rounded-full border border-sky-800 bg-sky-950/50 text-sky-200"
        : value === "VOD_REVIEW"
          ? "rounded-full border border-violet-200 bg-violet-50 text-violet-800"
          : value === "TOURNOI"
            ? "rounded-full border border-amber-800 bg-amber-950/50 text-amber-200"
            : value === "CUSTOM"
              ? "rounded-full border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800"
              : value === "TBD"
                ? "rounded-full border border-orange-800/70 bg-orange-950/40 text-orange-200"
                : "rounded-full border border-zinc-800 bg-zinc-800/50 text-zinc-500";
  return { label, cellClass };
}
