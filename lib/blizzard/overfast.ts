import { clampSr, rankFromSr } from "@/lib/rank";
import type { RankDivision } from "@prisma/client";

const OVERFAST_BASE = "https://overfast-api.tekrop.fr";

type OverfastRank = {
  division?: string | null;
  tier?: number | null;
};

type OverfastSummary = {
  competitive?: {
    pc?: {
      tank?: OverfastRank | null;
      damage?: OverfastRank | null;
      support?: OverfastRank | null;
    } | null;
    console?: {
      tank?: OverfastRank | null;
      damage?: OverfastRank | null;
      support?: OverfastRank | null;
    } | null;
  } | null;
};

const DIVISION_SR: Record<string, number> = {
  bronze: 500,
  silver: 1250,
  gold: 1750,
  platinum: 2250,
  emerald: 2750,
  diamond: 3250,
  master: 3750,
  grandmaster: 4250,
  champion: 4750,
};

export type OfficialRanks = {
  officialRankTank: string;
  officialRankDps: string;
  officialRankSupport: string;
  sr: number;
  rankDivision: RankDivision;
  syncedAt: Date;
};

function overfastPlayerId(battleTag: string): string {
  return battleTag.trim().replace("#", "-");
}

function formatRank(rank: OverfastRank | null | undefined): string {
  const division = rank?.division?.trim();
  if (!division) return "";
  const named = division.charAt(0).toUpperCase() + division.slice(1).toLowerCase();
  const tier = rank?.tier;
  if (typeof tier === "number" && tier > 0) return `${named} ${tier}`;
  return named;
}

function srFromRank(rank: OverfastRank | null | undefined): number | null {
  const division = rank?.division?.trim().toLowerCase();
  if (!division || !(division in DIVISION_SR)) return null;
  const base = DIVISION_SR[division];
  const tier = typeof rank?.tier === "number" ? rank.tier : 3;
  const offset = (3 - Math.min(5, Math.max(1, tier))) * 80;
  return clampSr(base + offset);
}

export async function fetchOfficialRanksFromBattleTag(
  battleTag: string,
): Promise<OfficialRanks | null> {
  const playerId = overfastPlayerId(battleTag);
  if (!playerId.includes("-")) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(
      `${OVERFAST_BASE}/players/${encodeURIComponent(playerId)}/summary`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as OverfastSummary;
    const ladder = payload.competitive?.pc ?? payload.competitive?.console;
    if (!ladder) return null;

    const officialRankTank = formatRank(ladder.tank);
    const officialRankDps = formatRank(ladder.damage);
    const officialRankSupport = formatRank(ladder.support);
    const elos = [
      srFromRank(ladder.tank),
      srFromRank(ladder.damage),
      srFromRank(ladder.support),
    ].filter((value): value is number => value !== null);

    if (!officialRankTank && !officialRankDps && !officialRankSupport) {
      return null;
    }

    const sr = elos.length
      ? clampSr(Math.round(elos.reduce((sum, value) => sum + value, 0) / elos.length))
      : 0;

    return {
      officialRankTank,
      officialRankDps,
      officialRankSupport,
      sr,
      rankDivision: rankFromSr(sr),
      syncedAt: new Date(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
