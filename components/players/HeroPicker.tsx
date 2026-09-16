"use client";

import { useMemo, useState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { HeroPortrait } from "@/components/players/HeroPortrait";
import { OW_HEROES, type HeroRole } from "@/lib/ow-heroes";
import { countHeroesByRole, heroRole } from "@/lib/heroes";

const HERO_GROUPS: { value: HeroRole; label: string }[] = [
  { value: "TANK", label: "Tank" },
  { value: "DPS", label: "DPS" },
  { value: "SUPPORT", label: "Support" },
];

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
      if (!heroRole(heroName)) return current;
      return [...current, heroName];
    });
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm uppercase tracking-wider text-zinc-400">
        Tier list
      </legend>
      <p className="mb-3 font-mono text-xs text-cyan-400">
        {selectedHeroes.length} héros · libre (0 ou plus)
      </p>
      <FieldError id="heroes-error" message={error} />
      {HERO_GROUPS.map((group) => (
        <div key={group.value} className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-orange-300">
            {group.label} · {counts[group.value]}
          </p>
          <div className="flex flex-wrap gap-2">
            {heroesByRole[group.value].map((hero) => {
              const checked = selectedHeroes.includes(hero.name);
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
