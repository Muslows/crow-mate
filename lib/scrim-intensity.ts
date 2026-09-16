import type { ScrimMapOutcome } from "@prisma/client";

export const SCRIM_INTENSITY_VALUES = [1, 2, 3] as const;

export type ScrimIntensity = (typeof SCRIM_INTENSITY_VALUES)[number];

const WIN_LABELS: Record<ScrimIntensity, string> = {
  1: "Victoire écrasante",
  2: "Victoire logique",
  3: "Victoire sur le fil",
};

const LOSS_LABELS: Record<ScrimIntensity, string> = {
  1: "Défaite lourde",
  2: "Défaite logique",
  3: "Défaite serrée",
};

export function isScrimIntensity(value: number): value is ScrimIntensity {
  return value === 1 || value === 2 || value === 3;
}

export function intensityCaption(
  outcome: ScrimMapOutcome,
  intensity: number,
): string {
  const level: ScrimIntensity = isScrimIntensity(intensity) ? intensity : 2;
  return outcome === "WIN" ? WIN_LABELS[level] : LOSS_LABELS[level];
}

export function averageIntensity(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

export function mapRecordLine(input: {
  wins: number;
  losses: number;
}): string {
  return `${input.wins}–${input.losses}`;
}

export function opponentDisplayName(input: {
  linkedName?: string | null;
  linkedTag?: string | null;
  nameInput?: string | null;
}): string {
  const linked = input.linkedName?.trim();
  if (linked) {
    const tag = input.linkedTag?.trim();
    return tag ? `${tag.toUpperCase()} | ${linked}` : linked;
  }
  const fallback = input.nameInput?.trim();
  return fallback || "Adversaire";
}
