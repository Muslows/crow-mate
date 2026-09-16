import Link from "next/link";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { RankBadge } from "@/components/ui/RankBadge";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { openPlayBadges } from "@/lib/specialties";
import type { PublicPlayerCard } from "@/lib/data/players";
import { affiliatedRoster } from "@/lib/recruitment";
import { publicDisplayName } from "@/lib/privacy";
import { rankFromSr } from "@/lib/rank";
import { teamDisplayName } from "@/lib/team-name";

export function PlayerScoutCard({ player }: { player: PublicPlayerCard }) {
  const displayName = publicDisplayName({
    displayName: player.displayName,
    name: player.user.name,
  });
  const teams = affiliatedRoster(player.user.rosterSlots);
  const badges = [
    ...openPlayBadges(player.openToPlay),
    player.user.isCoach ? "Coach officiel" : null,
    player.user.openToCoach === "OPEN" && !player.user.isCoach
      ? "Open to Coach"
      : null,
    player.user.isCaster || player.user.openToCast === "OPEN"
      ? "Open to Cast"
      : null,
    player.user.isStaff ? "Staff" : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <Link href={`/players/${player.id}`} className="hud-card hud-card-hover block p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-400">
        {teams[0]?.team.name
          ? teamDisplayName(teams[0].team.name, teams[0].team.org?.tag)
          : "Sans équipe"}
      </p>
      <h2 className="mt-2 truncate text-xl font-bold tracking-wide text-cyan-100">
        {displayName}
      </h2>
      {player.battleTagPublic && player.battleTag ? (
        <p className="mt-1 text-sm text-cyan-300/90">{player.battleTag}</p>
      ) : (
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
          BattleTag privé
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <RoleBadge role={player.role} />
        {player.openToPlay
          .filter((role) => role !== player.role)
          .slice(0, 2)
          .map((role) => (
            <RoleBadge key={role} role={role} compact />
          ))}
      </div>
      {badges.length > 0 ? (
        <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-orange-300">
          {badges.join(" · ")}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RankBadge rank={rankFromSr(player.sr)} sr={player.sr} />
        <span className="text-sm text-zinc-400">{player.sr} SR</span>
      </div>
      <div className="mt-3">
        <LanguageBadges languages={player.languages} />
      </div>
    </Link>
  );
}
