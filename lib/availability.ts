import type { DayAvailability, OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export const DAY_AVAILABILITIES = [
  {
    value: "DISPO_20H",
    label: "20h",
    hint: "Disponible à partir de 20h",
    cellClass:
      "rounded-full border-lime-300 bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.35)]",
    chipClass:
      "rounded-full border-lime-300 bg-lime-400 text-black transition data-[checked=true]:ring-2 data-[checked=true]:ring-lime-200",
  },
  {
    value: "DISPO_21H",
    label: "21h",
    hint: "Disponible à partir de 21h",
    cellClass:
      "rounded-full border-cyan-300 bg-cyan-400/85 text-black shadow-[0_0_12px_rgba(34,211,238,0.3)]",
    chipClass:
      "rounded-full border-cyan-300 bg-cyan-400/85 text-black transition data-[checked=true]:ring-2 data-[checked=true]:ring-cyan-100",
  },
  {
    value: "INCERTAIN",
    label: "Incertain",
    hint: "Pas sûr d'être disponible",
    cellClass:
      "rounded-full border-orange-300 bg-orange-400 text-black shadow-[0_0_12px_rgba(251,146,60,0.35)]",
    chipClass:
      "rounded-full border-orange-300 bg-orange-400 text-black transition data-[checked=true]:ring-2 data-[checked=true]:ring-orange-200",
  },
  {
    value: "INDISPO",
    label: "Indispo",
    hint: "Indisponible",
    cellClass:
      "rounded-full border-red-400 bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]",
    chipClass:
      "rounded-full border-red-400 bg-red-600 text-white transition data-[checked=true]:ring-2 data-[checked=true]:ring-red-200",
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
      cellClass: "rounded-full border-zinc-600 bg-zinc-800/80 text-zinc-400",
      chipClass: "border-zinc-600 bg-zinc-800 text-zinc-400",
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
      ? "rounded-full border-lime-300 bg-lime-400 text-black"
      : value === "SCRIM_21H"
        ? "rounded-full border-cyan-300 bg-cyan-400 text-black"
        : value === "VOD_REVIEW"
          ? "rounded-full border-violet-300 bg-violet-500/85 text-white"
          : value === "TOURNOI"
            ? "rounded-full border-amber-300 bg-amber-400 text-black"
            : value === "CUSTOM"
              ? "rounded-full border-fuchsia-300 bg-fuchsia-500/80 text-white"
              : value === "TBD"
                ? "rounded-full border-orange-400/70 bg-orange-400/15 text-orange-200"
                : "rounded-full border-zinc-600 bg-zinc-800/80 text-zinc-400";
  return { label, cellClass };
}
