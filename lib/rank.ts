import type { RankDivision } from "@prisma/client";

export const SR_MIN = 0;
export const SR_MAX = 5000;
export const SR_STEP = 50;

/** OW1-style 500 SR bands. 0 = unranked. Champion starts at 4500. */
const SR_RANK_THRESHOLDS: { min: number; rank: RankDivision }[] = [
  { min: 4500, rank: "CHAMPION" },
  { min: 4000, rank: "GRANDMASTER" },
  { min: 3500, rank: "MASTER" },
  { min: 3000, rank: "DIAMOND" },
  { min: 2500, rank: "PLATINUM" },
  { min: 2000, rank: "GOLD" },
  { min: 1500, rank: "SILVER" },
  { min: 1, rank: "BRONZE" },
];

export function clampSr(sr: number): number {
  if (!Number.isFinite(sr)) return SR_MIN;
  return Math.min(SR_MAX, Math.max(SR_MIN, sr));
}

export function snapSr(sr: number): number {
  const clamped = clampSr(sr);
  return Math.round(clamped / SR_STEP) * SR_STEP;
}

export function rankFromSr(sr: number): RankDivision {
  if (!Number.isInteger(sr) || sr <= 0) return "UNRANKED";
  const clamped = Math.min(sr, SR_MAX);
  const match = SR_RANK_THRESHOLDS.find((band) => clamped >= band.min);
  return match?.rank ?? "UNRANKED";
}
