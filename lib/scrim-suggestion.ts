import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export type PlayerSlotList = readonly string[] | null | undefined;

export type ScrimSuggestionKind = "RECOMMENDED" | "NEED_SUB" | "NO_SCRIM";

export type TeamSlotOption = { id: string; label: string };

export type ScrimSuggestion = {
  kind: ScrimSuggestionKind;
  label: string;
  bestSlotId: string | null;
  bestCount: number;
};

const KIND_LABEL: Record<ScrimSuggestionKind, string> = {
  RECOMMENDED: "Scrim recommandé",
  NEED_SUB: "Scrim possible (besoin d’un remplaçant)",
  NO_SCRIM: "Pas de scrim possible",
};

export function calculateScrimSuggestion(
  playerSlotLists: readonly PlayerSlotList[],
  slots: readonly TeamSlotOption[],
  options?: { lineupSize?: number },
): ScrimSuggestion {
  const lineupSize = Math.max(2, options?.lineupSize ?? 5);
  let bestSlotId: string | null = null;
  let bestLabel = KIND_LABEL.NO_SCRIM;
  let bestCount = 0;

  for (const slot of slots) {
    const count = playerSlotLists.filter((list) =>
      (list ?? []).includes(slot.id),
    ).length;
    if (count > bestCount) {
      bestCount = count;
      bestSlotId = slot.id;
      bestLabel = slot.label;
    }
  }

  const subFloor = Math.max(1, Math.ceil(lineupSize * 0.6));
  let kind: ScrimSuggestionKind = "NO_SCRIM";
  if (bestCount >= lineupSize) kind = "RECOMMENDED";
  else if (bestCount >= subFloor) kind = "NEED_SUB";

  return {
    kind,
    label:
      kind === "NO_SCRIM"
        ? KIND_LABEL.NO_SCRIM
        : kind === "NEED_SUB"
          ? `${KIND_LABEL.NEED_SUB} · ${bestLabel}`
          : `${KIND_LABEL.RECOMMENDED} · ${bestLabel}`,
    bestSlotId,
    bestCount,
  };
}

export function calculateWeekScrimSuggestions(
  daysByPlayer: ReadonlyArray<Record<WeekdayKey, string[]> | null>,
  slots: readonly TeamSlotOption[],
  options?: { lineupSize?: number },
): Record<WeekdayKey, ScrimSuggestion> {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((key) => [
      key,
      calculateScrimSuggestion(
        daysByPlayer.map((days) => days?.[key] ?? null),
        slots,
        options,
      ),
    ]),
  ) as Record<WeekdayKey, ScrimSuggestion>;
}

export function suggestionBadgeClass(kind: ScrimSuggestionKind): string {
  const shared =
    "rounded-full border px-2 py-1 text-xs transition-colors duration-200";
  switch (kind) {
    case "RECOMMENDED":
      return `${shared} border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200`;
    case "NEED_SUB":
      return `${shared} border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200`;
    case "NO_SCRIM":
      return `${shared} border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400`;
  }
}
