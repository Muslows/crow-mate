import { TeamPlanningBoard } from "@/components/planning/TeamPlanningBoard";
import { Panel } from "@/components/ui/Panel";
import { canWriteTeamPlanning } from "@/lib/access";
import { getTeamPlanningMatrix } from "@/lib/data/availability";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";
import {
  allowedWeekStarts,
  formatWeekRange,
  parseWeekOffset,
  weekStartForOffset,
} from "@/lib/week";

export default async function TeamPlanningPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ w?: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const { w } = await searchParams;
  const offset = parseWeekOffset(w);
  const [currentStart, nextStart] = allowedWeekStarts();
  const weekStartIso = weekStartForOffset(offset);
  const matrix = await getTeamPlanningMatrix(id, weekStartIso, session.user.id);
  if (!matrix) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-16">
        <p className="section-kicker">Accès restreint</p>
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          Planning réservé à l&apos;équipe
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Les horaires, disponibilités et activités officielles ne sont visibles
          que par le roster et le staff de cette équipe.
        </p>
      </main>
    );
  }

  const canWrite = await canWriteTeamPlanning(id, session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
          Planning d&apos;équipe
        </p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide">
          {teamDisplayName(matrix.team.name, matrix.team.org?.tag)}
        </h1>
        <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
          {canWrite ? "Coach / manager" : "Lecture seule"} · semaine du{" "}
          {formatWeekRange(weekStartIso)}
        </p>
      </div>
      <Panel>
        <TeamPlanningBoard
          offset={offset}
          currentStart={currentStart}
          nextStart={nextStart}
          weekStartIso={weekStartIso}
          teamId={matrix.team.id}
          players={matrix.players}
          suggestions={matrix.suggestions}
          official={matrix.official}
          officialNotes={matrix.officialNotes}
          officialEditable={canWrite}
          timeSlots={matrix.timeSlots}
        />
      </Panel>
    </main>
  );
}
