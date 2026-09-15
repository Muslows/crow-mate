"use client";

import { useMemo, useState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { HeroPortrait } from "@/components/players/HeroPortrait";
import { OW_HEROES } from "@/lib/ow-heroes";
import {
  countHeroesByRole,
  HERO_PER_ROLE_MAX,
  HERO_TOTAL_MIN,
  heroRole,
} from "@/lib/heroes";
import type { PlayerRole } from "@prisma/client";

export function HeroPicker({
  name = "heroes",
  defaultSelected = [],
  error,
}: {
  name?: string;
  defaultSelected?: string[];
  error?: string;
}) {
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>(defaultSelected);
  const counts = countHeroesByRole(selectedHeroes);

  const heroesByRole = useMemo(
    () => ({
      TANK: OW_HEROES.filter((hero) => hero.role === "TANK"),
      DPS: OW_HEROES.filter((hero) => hero.role === "DPS"),
      SUPPORT: OW_HEROES.filter((hero) => hero.role === "SUPPORT"),
    }),
    [],
  );

  function toggleHero(heroName: string) {
    setSelectedHeroes((current) => {
      if (current.includes(heroName)) {
        return current.filter((hero) => hero !== heroName);
      }
      const role = heroRole(heroName);
      if (!role) return current;
      const roleCount = countHeroesByRole(current)[role];
      if (roleCount >= HERO_PER_ROLE_MAX) return current;
      return [...current, heroName];
    });
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm uppercase tracking-wider text-zinc-400">
        Tier list — min {HERO_TOTAL_MIN} héros, max {HERO_PER_ROLE_MAX} par rôle
      </legend>
      <p className="mb-3 font-mono text-xs text-cyan-400">
        {selectedHeroes.length} sélectionnés · Tank {counts.TANK}/{HERO_PER_ROLE_MAX} ·
        DPS {counts.DPS}/{HERO_PER_ROLE_MAX} · Support {counts.SUPPORT}/
        {HERO_PER_ROLE_MAX}
      </p>
      <FieldError id="heroes-error" message={error} />
      {(Object.keys(heroesByRole) as PlayerRole[]).map((role) => (
        <div key={role} className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-orange-300">
            {role} · {counts[role]}/{HERO_PER_ROLE_MAX}
          </p>
          <div className="flex flex-wrap gap-2">
            {heroesByRole[role].map((hero) => {
              const checked = selectedHeroes.includes(hero.name);
              const roleFull = !checked && counts[role] >= HERO_PER_ROLE_MAX;
              return (
                <label
                  key={hero.name}
                  className={`flex cursor-pointer items-center gap-2 border px-2 py-1 font-mono text-xs ${
                    checked
                      ? "border-orange-400 text-orange-200"
                      : "border-cyan-400/20 text-zinc-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    name={name}
                    value={hero.name}
                    checked={checked}
                    disabled={roleFull}
                    onChange={() => toggleHero(hero.name)}
                    className="sr-only"
                  />
                  <HeroPortrait name={hero.name} size={36} />
                  {hero.name}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
