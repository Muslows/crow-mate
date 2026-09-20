import { notFound } from "next/navigation";
import { TeamScrimConfigForm } from "@/components/teams/ScrimConfigFields";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { Panel } from "@/components/ui/Panel";
import { canEditTeamScrimConfig } from "@/lib/access";
import { getTeamScrimConfig } from "@/lib/data/validated-scrims";
import { getTeamWithPlayers } from "@/lib/data/teams";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";

export default async function TeamScrimConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  if (!(await canEditTeamScrimConfig(id, session.user.id))) notFound();

  const [team, config] = await Promise.all([
    getTeamWithPlayers(id),
    getTeamScrimConfig(id),
  ]);
  if (!team) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="section-kicker">Administration équipe</p>
        <h1 className="text-3xl font-semibold uppercase tracking-wide">
          Configuration de Scrim
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {teamDisplayName(team.name, team.org?.tag)} · ces informations ne
          sont partagées qu’avec le staff adverse autour d’un scrim.
        </p>
        <TeamOpsLinks teamId={team.id} current="config" />
      </div>
      <Panel>
        <TeamScrimConfigForm teamId={team.id} config={config} />
      </Panel>
    </main>
  );
}
