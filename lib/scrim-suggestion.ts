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

  const kind = resolveKind(availableAt20, availableAt21);
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
): ScrimSuggestionKind {
  // Cas 1 — 5+ DISPO_20H (disponibles dès 20h, donc aussi à 21h).
  if (availableAt20 >= 5) return "RECOMMENDED_20H";
  // Cas 2 — 5+ à 21h, aucun à 20h (tous DISPO_21H).
  if (availableAt21 >= 5 && availableAt20 === 0) return "RECOMMENDED_21H";
  // Cas 3 — 1–4 à 20h, le reste arrive à 21h pour atteindre 5.
  if (availableAt21 >= 5) return "SCRIM_21H";
  // Cas 4 — 3 ou 4 dispos au total (20h et/ou 21h).
  if (availableAt21 >= 3) return "NEED_SUB";
  // Cas 5 — moins de 3.
  return "NO_SCRIM";
}

export function calculateWeekScrimSuggestions(
  daysByPlayer: ReadonlyArray<Record<WeekdayKey, DayAvailability> | null>,
): Record<WeekdayKey, ScrimSuggestion> {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((key) => [
      key,
      calculateScrimSuggestion(daysByPlayer.map((days) => days?.[key] ?? null)),
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
