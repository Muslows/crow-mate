import { HeroPortrait } from "@/components/players/HeroPortrait";
import {
  groupHeroesByLane,
  HERO_LANE_LABELS,
  HERO_LANES,
} from "@/lib/hero-lanes";
import { findHero, type HeroRole } from "@/lib/ow-heroes";

const ROLE_TONES: Record<HeroRole, string> = {
  TANK: "border-sky-400/40 text-sky-200",
  DPS: "border-orange-400/40 text-orange-200",
  SUPPORT: "border-lime-400/40 text-lime-200",
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
      className={`flex items-center gap-2 rounded-md border bg-black/35 py-1 pr-2 pl-1 ${tone}`}
    >
      <span className="w-5 shrink-0 text-center font-mono text-[0.6rem] text-orange-300">
        {rank}
      </span>
      <HeroPortrait name={name} size={28} />
      <span className="min-w-0 truncate font-mono text-[0.7rem] uppercase tracking-wide">
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
          <h3 className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-orange-300">
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
