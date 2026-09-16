import type { ScrimMapOutcome } from "@prisma/client";

export type ScrimMapSnapshot = {
  outcome: ScrimMapOutcome;
  intensity: number;
};

export type ScrimSummaryKind =
  | "CRUSHING_WIN"
  | "SOLID_WIN"
  | "CLOSE_WIN"
  | "BALANCED"
  | "CLOSE_LOSS"
  | "SOLID_LOSS"
  | "HEAVY_LOSS";

export type ScrimSummary = {
  kind: ScrimSummaryKind;
  label: string;
  score: number;
  tone: "lime" | "cyan" | "orange" | "red";
};

function signedMapScore(map: ScrimMapSnapshot): number {
  const intensity = Math.min(3, Math.max(1, map.intensity));
  const magnitude = 4 - intensity;
  return map.outcome === "WIN" ? magnitude : -magnitude;
}

export function generateScrimSummary(
  maps: readonly ScrimMapSnapshot[],
): ScrimSummary | null {
  if (maps.length === 0) return null;
  const score =
    Math.round(
      (maps.reduce((total, map) => total + signedMapScore(map), 0) /
        maps.length) *
        10,
    ) / 10;

  if (score >= 2.5) {
    return {
      kind: "CRUSHING_WIN",
      label: "Victoire nette et écrasante",
      score,
      tone: "lime",
    };
  }
  if (score >= 1.5) {
    return {
      kind: "SOLID_WIN",
      label: "Victoire nette",
      score,
      tone: "lime",
    };
  }
  if (score >= 0.4) {
    return {
      kind: "CLOSE_WIN",
      label: "Victoire sur le fil",
      score,
      tone: "cyan",
    };
  }
  if (score > -0.4) {
    return {
      kind: "BALANCED",
      label: "Match équilibré",
      score,
      tone: "orange",
    };
  }
  if (score >= -1.5) {
    return {
      kind: "CLOSE_LOSS",
      label: "Défaite sur le fil / Très serré",
      score,
      tone: "orange",
    };
  }
  if (score >= -2.5) {
    return {
      kind: "SOLID_LOSS",
      label: "Défaite nette",
      score,
      tone: "red",
    };
  }
  return {
    kind: "HEAVY_LOSS",
    label: "Défaite lourde",
    score,
    tone: "red",
  };
}
