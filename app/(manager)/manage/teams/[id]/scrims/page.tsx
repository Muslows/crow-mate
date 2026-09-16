import { notFound } from "next/navigation";
import Link from "next/link";
import { ScrimReportForm } from "@/components/scrims/ScrimReportForm";
import { ScrimHistory } from "@/components/scrims/ScrimHistory";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { Panel } from "@/components/ui/Panel";
import { canRecordTeamScrim } from "@/lib/access";
import { getTeamScrims } from "@/lib/data/scrims";
import { getOpponentTeamOptions, getTeamWithPlayers } from "@/lib/data/teams";
import { OPPONENT_BEHAVIORS, parseOpponentBehavior } from "@/lib/fair-play";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";

export default async function TeamScrimsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ behavior?: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const { behavior: behaviorParam } = await searchParams;
  const allowed = await canRecordTeamScrim(id, session.user.id);
  if (!allowed) notFound();
  const team = await getTeamWithPlayers(id);
  if (!team) notFound();
  const behavior = parseOpponentBehavior(behaviorParam);
  const [scrims, opponents] = await Promise.all([
    getTeamScrims(team.id, behavior),
    getOpponentTeamOptions(team.id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          Analyse scrims
        </p>
        <h1 className="text-3xl font-semibold uppercase tracking-wide">
          {teamDisplayName(team.name, team.org?.tag)}
        </h1>
        <TeamOpsLinks teamId={team.id} current="scrims" />
      </div>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Nouveau rapport
        </h2>
        <ScrimReportForm teamId={team.id} opponents={opponents} />
      </Panel>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
          Historique
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/manage/teams/${team.id}/scrims`}
            className={`hud-btn-ghost ${behavior ? "" : "border-cyan-400/60"}`}
          >
            Tous
          </Link>
          {OPPONENT_BEHAVIORS.map((option) => (
            <Link
              key={option.value}
              href={`/manage/teams/${team.id}/scrims?behavior=${option.value}`}
              className={`hud-btn-ghost ${
                behavior === option.value ? "border-cyan-400/60" : ""
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <ScrimHistory teamId={team.id} scrims={scrims} opponents={opponents} />
      </section>
    </main>
  );
}
