import { OW_HEROES } from "@/lib/constants";
import type { HeroRole } from "@/lib/ow-heroes";

export function heroRole(name: string): HeroRole | undefined {
  return OW_HEROES.find((hero) => hero.name === name)?.role;
}

export function countHeroesByRole(heroes: string[]): Record<HeroRole, number> {
  const counts: Record<HeroRole, number> = {
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
