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
      className="group flex items-center gap-4 border border-cyan-400/25 bg-black/40 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/70 hover:bg-orange-400/5 hover:shadow-[0_0_32px_rgba(255,154,31,0.16)]"
    >
      <TeamMark name={team.name} />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-cyan-400 group-hover:text-orange-300">
          Équipe actuelle
        </span>
        <span className="truncate text-xl font-semibold uppercase tracking-wide text-cyan-50">
          {teamDisplayName(team.name, team.org?.tag)}
        </span>
        {team.language ? (
          <LanguageBadges languages={[team.language]} />
        ) : null}
      </span>
      <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-zinc-500 group-hover:text-orange-300 sm:inline">
        Voir le roster →
      </span>
    </Link>
  );
}
