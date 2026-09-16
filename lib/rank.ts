import type { RankDivision } from "@prisma/client";

export const SR_MIN = 0;
export const SR_MAX = 5000;
export const SR_STEP = 50;
export const SENSITIVITY_MIN = 0;
export const SENSITIVITY_MAX = 300;
export const SENSITIVITY_STEP = 50;

/**
 * Barème compétitif (bornes inclusives basses).
 * Bronze 0–999, Silver 1000–1499, Gold 1500–1999, Platinum 2000–2499,
 * Emerald 2500–2999, Diamond 3000–3499, Master 3500–3999,
 * Grandmaster 4000–4499, Champion 4500–5000.
 */
const SR_RANK_THRESHOLDS: { min: number; rank: RankDivision }[] = [
  { min: 4500, rank: "CHAMPION" },
  { min: 4000, rank: "GRANDMASTER" },
  { min: 3500, rank: "MASTER" },
  { min: 3000, rank: "DIAMOND" },
  { min: 2500, rank: "EMERALD" },
  { min: 2000, rank: "PLATINUM" },
  { min: 1500, rank: "GOLD" },
  { min: 1000, rank: "SILVER" },
  { min: 0, rank: "BRONZE" },
];

export function clampSr(sr: number): number {
  if (!Number.isFinite(sr)) return SR_MIN;
  return Math.min(SR_MAX, Math.max(SR_MIN, sr));
}

export function snapSr(sr: number): number {
  const clamped = clampSr(sr);
  return Math.round(clamped / SR_STEP) * SR_STEP;
}

export function snapSensitivity(value: number): number {
  if (!Number.isFinite(value)) return SENSITIVITY_MIN;
  const clamped = Math.min(SENSITIVITY_MAX, Math.max(SENSITIVITY_MIN, value));
  return Math.round(clamped / SENSITIVITY_STEP) * SENSITIVITY_STEP;
}

export function eloSearchBand(
  target: number,
  sensitivity: number,
): { min: number; max: number } {
  const snappedTarget = snapSr(target);
  const snappedSensitivity = snapSensitivity(sensitivity);
  return {
    min: clampSr(snappedTarget - snappedSensitivity),
    max: clampSr(snappedTarget + snappedSensitivity),
  };
}

export function rankFromSr(sr: number): RankDivision {
  if (!Number.isFinite(sr) || sr < 0) return "UNRANKED";
  const clamped = Math.min(Math.trunc(sr), SR_MAX);
  const match = SR_RANK_THRESHOLDS.find((band) => clamped >= band.min);
  return match?.rank ?? "UNRANKED";
}
