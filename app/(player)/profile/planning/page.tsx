import Link from "next/link";
import { SundayPlanningBanner } from "@/components/planning/SundayPlanningBanner";
import { WeeklyScheduleForm } from "@/components/planning/WeeklyScheduleForm";
import { PlanningWeekFrame } from "@/components/planning/WeekSwitcher";
import { AvailabilityLegend } from "@/components/planning/AvailabilityLegend";
import { Panel } from "@/components/ui/Panel";
import { db } from "@/lib/db";
import {
  EMPTY_OFFICIAL_WEEK,
  getOfficialSchedulesForTeams,
  hasSavedWeek,
  resolvePlayerWeekDefaults,
} from "@/lib/data/availability";
import { OfficialScheduleStrip } from "@/components/planning/OfficialScheduleStrip";
import { requirePlayerSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";
import {
  allowedWeekStarts,
  civilToIso,
  formatDayHeading,
  formatWeekRange,
  parseWeekOffset,
  weekDays,
  weekSnapshot,
  weekStartForOffset,
} from "@/lib/week";

export default async function PlayerPlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const session = await requirePlayerSession();
  const { w } = await searchParams;
  const offset = parseWeekOffset(w);
  const snapshot = weekSnapshot();
  const [currentStart, nextStart] = allowedWeekStarts();
  const weekStartIso = weekStartForOffset(offset);
  const profile = await db.playerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      sr: 0,
      role: "TANK",
      favoriteHeroes: [],
      experience: "",
      recruitmentStatus: "LOOKING",
    },
    update: {},
  });
  const defaults = await resolvePlayerWeekDefaults(profile.id, weekStartIso);
  const nextWeekSaved = await hasSavedWeek(profile.id, civilToIso(snapshot.nextStart));
  const columns = weekDays(weekStartIso).map((day) => ({
    key: day.key,
    label: formatDayHeading(day.iso),
  }));
  const roster = await db.player.findMany({
    where: { userId: session.user.id, team: { isNot: null } },
    select: {
      team: {
        select: { id: true, name: true, org: { select: { tag: true } } },
      },
    },
  });
  const teamIds = roster.flatMap((slot) => (slot.team ? [slot.team.id] : []));
  const officialRows = await getOfficialSchedulesForTeams(teamIds, weekStartIso);
  const officialByTeam = new Map(
    officialRows.map((row) => [row.team.id, row] as const),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
          Disponibilités
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Mon planning
        </h1>
      </div>
      <SundayPlanningBanner
        isSunday={snapshot.isSunday}
        nextWeekSaved={nextWeekSaved}
      />
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
          Semaine du {formatWeekRange(weekStartIso)}
        </h2>
        <AvailabilityLegend />
        <div className="mt-4">
          <PlanningWeekFrame
            offset={offset}
            currentLabel={formatWeekRange(currentStart)}
            nextLabel={formatWeekRange(nextStart)}
          >
            <WeeklyScheduleForm
              key={weekStartIso}
              weekStartDate={weekStartIso}
              days={defaults.days}
              columns={columns}
              previousCopied={defaults.previousCopied && !defaults.saved}
            />
          </PlanningWeekFrame>
        </div>
      </Panel>
      {roster.length > 0 ? (
        <Panel>
          <h2 className="mb-3 text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Planning d&apos;équipe
          </h2>
          <ul className="flex flex-col gap-6">
            {roster.map((slot) =>
              slot.team ? (
                <li key={slot.team.id} className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold uppercase">
                      {teamDisplayName(slot.team.name, slot.team.org?.tag)}
                    </p>
                    <Link
                      href={`/teams/${slot.team.id}/planning`}
                      className="hud-btn-ghost"
                    >
                      Matrice
                    </Link>
                  </div>
                  <OfficialScheduleStrip
                    weekStartIso={weekStartIso}
                    days={
                      officialByTeam.get(slot.team.id)?.days ?? EMPTY_OFFICIAL_WEEK
                    }
                    notes={officialByTeam.get(slot.team.id)?.notes}
                  />
                </li>
              ) : null,
            )}
          </ul>
        </Panel>
      ) : null}
    </main>
  );
}
