import { HeroPortrait } from "@/components/players/HeroPortrait";
import { findHero } from "@/lib/ow-heroes";

const ROLE_TONES = {
  TANK: "border-cyan-400/50 text-cyan-200",
  DPS: "border-orange-400/50 text-orange-200",
  SUPPORT: "border-lime-400/50 text-lime-200",
} as const;

export function HeroTile({
  name,
  rank,
}: {
  name: string;
  rank: number;
}) {
  const hero = findHero(name);
  const tone = hero ? ROLE_TONES[hero.role] : "border-zinc-500 text-zinc-400";

  return (
    <li
      className={`relative flex flex-col items-center gap-2 border bg-black/40 p-3 ${tone}`}
    >
      <span className="absolute left-2 top-2 font-mono text-[0.65rem] text-orange-300">
        #{rank}
      </span>
      <HeroPortrait name={name} size={96} />
      <span className="px-1 text-center font-mono text-xs uppercase tracking-wide">
        {name}
      </span>
      {hero ? (
        <span className="text-[0.6rem] uppercase tracking-[0.16em] text-zinc-500">
          {hero.role}
        </span>
      ) : null}
    </li>
  );
}

export function HeroTierList({ heroes }: { heroes: string[] }) {
  if (heroes.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Tier list non renseignée.</p>
    );
  }

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {heroes.map((name, index) => (
        <HeroTile key={`${name}-${index}`} name={name} rank={index + 1} />
      ))}
    </ol>
  );
}
