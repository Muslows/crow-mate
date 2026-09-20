import type { DayAvailability } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export type PlayerAvailability = DayAvailability | null | undefined;

export type ScrimSuggestionKind =
  | "RECOMMENDED_20H"
  | "RECOMMENDED_21H"
  | "SCRIM_21H"
  | "NEED_SUB"
  | "NO_SCRIM";

export type ScrimSuggestion = {
  kind: ScrimSuggestionKind;
  label: string;
  availableAt20: number;
  availableAt21: number;
};

const SUGGESTION_LABELS: Record<ScrimSuggestionKind, string> = {
  RECOMMENDED_20H: "Scrim recommandé à 20h",
  RECOMMENDED_21H: "Scrim recommandé à 21h",
  SCRIM_21H: "Scrim à 21h",
  NEED_SUB: "Scrim possible (Besoin d'un remplaçant - Non recommandé)",
  NO_SCRIM: "Pas de Scrim possible",
};

export function calculateScrimSuggestion(
  playerAvailabilities: readonly PlayerAvailability[],
  options?: { lineupSize?: number },
): ScrimSuggestion {
  let availableAt20 = 0;
  let availableAt21 = 0;

  for (const status of playerAvailabilities) {
    if (status === "DISPO_20H") {
      availableAt20 += 1;
      availableAt21 += 1;
    } else if (status === "DISPO_21H") {
      availableAt21 += 1;
    }
  }

  const kind = resolveKind(
    availableAt20,
    availableAt21,
    Math.max(2, options?.lineupSize ?? 5),
  );
  return {
    kind,
    label: SUGGESTION_LABELS[kind],
    availableAt20,
    availableAt21,
  };
}

function resolveKind(
  availableAt20: number,
  availableAt21: number,
  lineupSize: number,
): ScrimSuggestionKind {
  const full = lineupSize;
  const subFloor = Math.max(1, Math.ceil(full * 0.6));
  if (availableAt20 >= full) return "RECOMMENDED_20H";
  if (availableAt21 >= full && availableAt20 === 0) return "RECOMMENDED_21H";
  if (availableAt21 >= full) return "SCRIM_21H";
  if (availableAt21 >= subFloor) return "NEED_SUB";
  return "NO_SCRIM";
}

export function calculateWeekScrimSuggestions(
  daysByPlayer: ReadonlyArray<Record<WeekdayKey, DayAvailability> | null>,
  options?: { lineupSize?: number },
): Record<WeekdayKey, ScrimSuggestion> {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((key) => [
      key,
      calculateScrimSuggestion(
        daysByPlayer.map((days) => days?.[key] ?? null),
        options,
      ),
    ]),
  ) as Record<WeekdayKey, ScrimSuggestion>;
}

export function suggestionBadgeClass(kind: ScrimSuggestionKind): string {
  const shared =
    "rounded-full border px-2 py-1 text-xs transition-colors duration-200";
  switch (kind) {
    case "RECOMMENDED_20H":
      return `${shared} border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200`;
    case "RECOMMENDED_21H":
      return `${shared} border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200`;
    case "SCRIM_21H":
      return `${shared} border-sky-200 bg-white text-sky-800 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-200`;
    case "NEED_SUB":
      return `${shared} border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200`;
    case "NO_SCRIM":
      return `${shared} border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400`;
  }
}
