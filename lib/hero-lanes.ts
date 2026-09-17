import type { HeroRole } from "@/lib/ow-heroes";
import { findHero } from "@/lib/ow-heroes";

export const HERO_LANES: HeroRole[] = ["TANK", "DPS", "SUPPORT"];

export const HERO_LANE_LABELS: Record<HeroRole, string> = {
  TANK: "Tank",
  DPS: "DPS",
  SUPPORT: "Support",
};

export const MAX_HEROES_PER_LANE = 5;

export function emptyLaneBoard(): Record<HeroRole, string[]> {
  return { TANK: [], DPS: [], SUPPORT: [] };
}

export function heroLane(name: string): HeroRole | undefined {
  return findHero(name)?.role;
}

export function groupHeroesByLane(
  heroes: string[],
): Record<HeroRole, string[]> {
  const board = emptyLaneBoard();
  const seen = new Set<string>();
  for (const name of heroes) {
    if (seen.has(name)) continue;
    const lane = heroLane(name);
    if (!lane) continue;
    seen.add(name);
    board[lane].push(name);
  }
  return board;
}

export function flattenLaneBoard(
  board: Record<HeroRole, string[]>,
): string[] {
  return HERO_LANES.flatMap((lane) => board[lane]);
}
