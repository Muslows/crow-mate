import { OW_HEROES } from "@/lib/constants";
import type { PlayerRole } from "@prisma/client";

export const HERO_TOTAL_MIN = 5;
export const HERO_PER_ROLE_MAX = 5;

export function heroRole(name: string): PlayerRole | undefined {
  return OW_HEROES.find((hero) => hero.name === name)?.role;
}

export function countHeroesByRole(heroes: string[]): Record<PlayerRole, number> {
  const counts: Record<PlayerRole, number> = {
    TANK: 0,
    DPS: 0,
    SUPPORT: 0,
  };
  for (const name of heroes) {
    const role = heroRole(name);
    if (role) counts[role] += 1;
  }
  return counts;
}
