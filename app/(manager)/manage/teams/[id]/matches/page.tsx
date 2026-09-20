import { notFound } from "next/navigation";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { ValidatedScrimCards } from "@/components/scrims/ValidatedScrimCards";
import { canViewTeamMatchCenter } from "@/lib/access";
import { getAcceptedScrimsForTeam } from "@/lib/data/validated-scrims";
import { getTeamWithPlayers } from "@/lib/data/teams";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";

export default async function TeamValidatedScrimsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const allowed = await canViewTeamMatchCenter(id, session.user.id);
  if (!allowed) notFound();
  const team = await getTeamWithPlayers(id);
  if (!team) notFound();
  const matches = await getAcceptedScrimsForTeam(team.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="section-kicker">Match center</p>
        <h1 className="text-3xl font-semibold uppercase tracking-wide">
          Scrims validés
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {teamDisplayName(team.name, team.org?.tag)} · les propositions acceptées
          apparaissent ici, dans l&apos;ordre du calendrier.
        </p>
        <TeamOpsLinks teamId={team.id} current="matches" />
      </div>
      <ValidatedScrimCards
        viewerTeamId={team.id}
        currentUserId={session.user.id}
        matches={matches}
      />
    </main>
  );
}
