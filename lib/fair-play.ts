export const OPPONENT_BEHAVIORS = [
  {
    value: "COURTOIS",
    label: "Courtois",
    hint: "Très agréable, excellente communication — à solliciter en priorité",
    score: 4,
  },
  {
    value: "BON",
    label: "Bon",
    hint: "Comportement standard et respectueux",
    score: 3,
  },
  {
    value: "PEU_AGREABLE",
    label: "Peu agréable",
    hint: "Attitude limite ou manque de ponctualité",
    score: 2,
  },
  {
    value: "TOXIQUE_OU_TROLL",
    label: "Toxique / troll",
    hint: "Anti-jeu, insultes ou leave — à éviter",
    score: 1,
  },
] as const;

export type OpponentBehavior = (typeof OPPONENT_BEHAVIORS)[number]["value"];

export function parseOpponentBehavior(
  value?: string | null,
): OpponentBehavior | undefined {
  return OPPONENT_BEHAVIORS.some((item) => item.value === value)
    ? (value as OpponentBehavior)
    : undefined;
}

export const BEHAVIOR_LABELS: Record<OpponentBehavior, string> = {
  COURTOIS: "Courtois",
  BON: "Bon",
  PEU_AGREABLE: "Peu agréable",
  TOXIQUE_OU_TROLL: "Toxique / troll",
};

export const BEHAVIOR_WEIGHTS: Record<OpponentBehavior, number> = {
  COURTOIS: 4,
  BON: 3,
  PEU_AGREABLE: 2,
  TOXIQUE_OU_TROLL: 1,
};

export type FairPlayIndex = {
  total: number;
  average: number | null;
  trend: OpponentBehavior | null;
  label: string;
  counts: Record<OpponentBehavior, number>;
};

export function emptyFairPlayIndex(): FairPlayIndex {
  return {
    total: 0,
    average: null,
    trend: null,
    label: "Pas encore d'index fair-play",
    counts: {
      COURTOIS: 0,
      BON: 0,
      PEU_AGREABLE: 0,
      TOXIQUE_OU_TROLL: 0,
    },
  };
}

export function labelFromFairPlayAverage(average: number): {
  trend: OpponentBehavior;
  label: string;
} {
  if (average >= 3.5) return { trend: "COURTOIS", label: "Courtois" };
  if (average >= 2.75) return { trend: "BON", label: "Bon" };
  if (average >= 1.75) return { trend: "PEU_AGREABLE", label: "Peu agréable" };
  return { trend: "TOXIQUE_OU_TROLL", label: "Toxique / troll" };
}

export function buildFairPlayIndex(
  counts: Record<OpponentBehavior, number>,
): FairPlayIndex {
  const total =
    counts.COURTOIS +
    counts.BON +
    counts.PEU_AGREABLE +
    counts.TOXIQUE_OU_TROLL;
  if (total === 0) return emptyFairPlayIndex();
  const weighted =
    counts.COURTOIS * BEHAVIOR_WEIGHTS.COURTOIS +
    counts.BON * BEHAVIOR_WEIGHTS.BON +
    counts.PEU_AGREABLE * BEHAVIOR_WEIGHTS.PEU_AGREABLE +
    counts.TOXIQUE_OU_TROLL * BEHAVIOR_WEIGHTS.TOXIQUE_OU_TROLL;
  const average = Math.round((weighted / total) * 10) / 10;
  const { trend, label } = labelFromFairPlayAverage(average);
  return { total, average, trend, label, counts };
}
