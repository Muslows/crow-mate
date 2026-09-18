import Link from "next/link";
import { RankBadge } from "@/components/ui/RankBadge";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { openPlayBadges } from "@/lib/specialties";
import type { PublicPlayerCard } from "@/lib/data/players";
import { affiliatedRoster } from "@/lib/recruitment";
import { publicDisplayName } from "@/lib/privacy";
import { rankFromSr } from "@/lib/rank";
import { teamDisplayName } from "@/lib/team-name";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerScoutCard({ player }: { player: PublicPlayerCard }) {
  const displayName = publicDisplayName({
    displayName: player.displayName,
    name: player.user.name,
  });
  const teams = affiliatedRoster(player.user.rosterSlots);
  const extra = openPlayBadges(player.openToPlay).slice(0, 1);

  return (
    <Link href={`/players/${player.id}`} className="hud-card hud-card-hover block p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-800 transition-colors duration-200 dark:bg-orange-950/40 dark:text-orange-200">
          {initials(displayName) || "OW"}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-foreground">{displayName}</h2>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
            {teams[0]?.team.name
              ? teamDisplayName(teams[0].team.name, teams[0].team.org?.tag)
              : extra[0] ?? "Sans équipe"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RoleBadge role={player.role} compact />
        <RankBadge rank={rankFromSr(player.sr)} sr={player.sr} />
      </div>
    </Link>
  );
}
