import { notFound } from "next/navigation";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { TeamPlanningBoard } from "@/components/planning/TeamPlanningBoard";
import { Panel } from "@/components/ui/Panel";
import { canWriteTeamPlanning } from "@/lib/access";
import { getTeamPlanningMatrix } from "@/lib/data/availability";
import { requireAuthSession } from "@/lib/session";
import { getTeamWithPlayers } from "@/lib/data/teams";
import { teamDisplayName } from "@/lib/team-name";
import {
  allowedWeekStarts,
  formatWeekRange,
  parseWeekOffset,
  weekStartForOffset,
} from "@/lib/week";

export default async function ManagerTeamPlanningPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ w?: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const { w } = await searchParams;
  const canWrite = await canWriteTeamPlanning(id, session.user.id);
  if (!canWrite) notFound();
  const team = await getTeamWithPlayers(id);
  if (!team) notFound();

  const offset = parseWeekOffset(w);
  const [currentStart, nextStart] = allowedWeekStarts();
  const weekStartIso = weekStartForOffset(offset);
  const matrix = await getTeamPlanningMatrix(
    team.id,
    weekStartIso,
    session.user.id,
  );
  if (!matrix) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
            Planning roster
          </p>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide">
            {teamDisplayName(team.name, team.org?.tag)}
          </h1>
          <p className="mt-1 font-mono text-sm text-zinc-400">
            Semaine du {formatWeekRange(weekStartIso)}
          </p>
          <div className="mt-3">
            <TeamOpsLinks teamId={team.id} current="planning" />
          </div>
        </div>
      </div>
      <Panel>
        <TeamPlanningBoard
          offset={offset}
          currentStart={currentStart}
          nextStart={nextStart}
          weekStartIso={weekStartIso}
          teamId={team.id}
          players={matrix.players}
          suggestions={matrix.suggestions}
          official={matrix.official}
          officialNotes={matrix.officialNotes}
          officialEditable
        />
      </Panel>
    </main>
  );
}
