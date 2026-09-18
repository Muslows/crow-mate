import Link from "next/link";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { TeamMark } from "@/components/teams/TeamMark";
import type { SpokenLanguage } from "@prisma/client";
import { teamDisplayName } from "@/lib/team-name";

export function AffiliatedTeamCard({
  team,
}: {
  team: {
    id: string;
    name: string;
    language?: SpokenLanguage;
    org?: { tag: string } | null;
  };
}) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-orange-800/70 hover:shadow-sm"
    >
      <TeamMark name={team.name} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Équipe actuelle
        </span>
        <span className="truncate text-lg font-semibold text-foreground">
          {teamDisplayName(team.name, team.org?.tag)}
        </span>
        {team.language ? (
          <LanguageBadges languages={[team.language]} />
        ) : null}
      </span>
      <span className="hidden text-sm text-zinc-600 transition-colors duration-200 group-hover:text-orange-700 dark:text-zinc-400 dark:group-hover:text-orange-400 sm:inline">
        Voir le roster
      </span>
    </Link>
  );
}
