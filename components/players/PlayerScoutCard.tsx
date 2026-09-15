import Link from "next/link";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { RankBadge } from "@/components/ui/RankBadge";
import { Panel } from "@/components/ui/Panel";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";
import type { PublicPlayerCard } from "@/lib/data/players";
import { affiliatedRoster } from "@/lib/recruitment";
import { rankFromSr } from "@/lib/rank";

export function PlayerScoutCard({ player }: { player: PublicPlayerCard }) {
  const displayTag = player.battleTag || player.user.name;
  const teams = affiliatedRoster(player.user.rosterSlots);

  return (
    <Link href={`/players/${player.id}`} className="block">
      <Panel className="h-full transition hover:border-orange-400/50">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-400">
          {teams[0]?.team.name ?? "Sans équipe"}
        </p>
        <h2 className="mt-2 font-mono text-xl text-cyan-100">{displayTag}</h2>
        <p className="mt-1 text-sm text-zinc-500">{player.user.name}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RankBadge rank={rankFromSr(player.sr)} sr={player.sr} />
          <span className="font-mono text-sm text-zinc-400">{player.sr} SR</span>
        </div>
        <p className="mt-2 text-sm uppercase tracking-wider text-zinc-400">
          {labelFor(PLAYER_ROLES, player.primaryRole)}
          {player.secondaryRole
            ? ` / ${labelFor(PLAYER_ROLES, player.secondaryRole)}`
            : ""}
        </p>
        <div className="mt-3">
          <LanguageBadges languages={player.languages} />
        </div>
      </Panel>
    </Link>
  );
}
