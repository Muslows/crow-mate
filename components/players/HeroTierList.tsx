import { HeroPortrait } from "@/components/players/HeroPortrait";
import {
  groupHeroesByLane,
  HERO_LANE_LABELS,
  HERO_LANES,
} from "@/lib/hero-lanes";
import { findHero, type HeroRole } from "@/lib/ow-heroes";

const ROLE_TONES: Record<HeroRole, string> = {
  TANK: "border-sky-200 text-sky-800",
  DPS: "border-orange-800/70 text-orange-200",
  SUPPORT: "border-lime-200 text-lime-800",
};

export function HeroTile({
  name,
  rank,
  lane,
}: {
  name: string;
  rank: number;
  lane?: HeroRole;
}) {
  const hero = findHero(name);
  const tone = lane ? ROLE_TONES[lane] : "border-zinc-500 text-zinc-400";

  return (
    <li
      className={`flex items-center gap-2 rounded-md border bg-zinc-800/50 py-1 pr-2 pl-1 ${tone}`}
    >
      <span className="w-5 shrink-0 text-center font-mono text-[0.6rem] text-zinc-500">
        {rank}
      </span>
      <HeroPortrait name={name} size={28} />
      <span className="min-w-0 truncate text-xs font-medium">
        {name}
      </span>
      {hero ? <span className="sr-only">{hero.role}</span> : null}
    </li>
  );
}

export function HeroTierList({ heroes }: { heroes: string[] }) {
  if (heroes.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Tier list non renseignée.</p>
    );
  }

  const board = groupHeroesByLane(heroes);
  const lanes = HERO_LANES.filter((lane) => board[lane].length > 0);

  if (lanes.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Tier list non renseignée.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {lanes.map((lane) => (
        <section key={lane} className="min-w-0">
          <h3 className="mb-1.5 text-xs font-semibold text-zinc-400">
            {HERO_LANE_LABELS[lane]}
          </h3>
          <ol className="flex flex-col gap-1">
            {board[lane].map((name, index) => (
              <HeroTile
                key={`${lane}-${name}`}
                name={name}
                rank={index + 1}
                lane={lane}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
