import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { PlayerList } from "@/components/players/PlayerList";
import { TeamManagerCard } from "@/components/teams/TeamManagerCard";
import { TeamMark } from "@/components/teams/TeamMark";
import { FairPlayIndexCard } from "@/components/teams/FairPlayIndexCard";
import { FairPlayBadge } from "@/components/ui/FairPlayBadge";
import { RankBadge } from "@/components/ui/RankBadge";
import { labelFor, PLATFORMS, STRUCTURES } from "@/lib/constants";
import { getTeamFairPlayIndex } from "@/lib/data/fair-play";
import { getTeamWithPlayers } from "@/lib/data/teams";
import { rankFromSr } from "@/lib/rank";
import { ContactTeamButton } from "@/components/chat/ContactTeamButton";
import { ReportButton } from "@/components/reports/ReportButton";
import {
  getSession,
  hasPlayerAccess,
  sessionCapabilities,
} from "@/lib/session";
import { AffiliationBadge } from "@/components/teams/AffiliationBadge";
import { StaffRoster } from "@/components/teams/StaffRoster";
import { teamDisplayName } from "@/lib/team-name";
import { canViewTeamPlanning } from "@/lib/data/availability";
import { listOpenPositionsForTeam } from "@/lib/data/open-positions";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PublicTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeamWithPlayers(id);
  if (!team) notFound();

  const session = await getSession();
  const estimatedSr = team.estimatedSr;
  const fairPlay = await getTeamFairPlayIndex(team.id);
  const canContactTeam =
    session &&
    hasPlayerAccess(sessionCapabilities(session)) &&
    session.user.id !== team.managerId;
  const canReportTeam = Boolean(session && session.user.id !== team.managerId);
  const showPlanning = session
    ? await canViewTeamPlanning(team.id, session.user.id, session.user.role ?? "")
    : false;
  const openPositions = await listOpenPositionsForTeam(team.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="h-28 bg-gradient-to-r from-zinc-800 via-orange-950/40 to-zinc-900 sm:h-36" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span className="rounded-full border-4 border-zinc-900 shadow-sm">
                <TeamMark name={team.name} />
              </span>
              <div className="pb-1">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {teamDisplayName(team.name, team.org?.tag)}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {labelFor(PLATFORMS, team.platform)} ·{" "}
                  {labelFor(STRUCTURES, team.structure)}
                </p>
              </div>
            </div>
            {estimatedSr > 0 ? (
              <RankBadge sr={estimatedSr} rank={rankFromSr(estimatedSr)} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-zinc-500">Niveau estimé</p>
            <p className="mt-1 text-lg font-semibold">
              {estimatedSr <= 0 ? "À définir" : `${estimatedSr} SR`}
            </p>
            <div className="mt-3">
              <AffiliationBadge
                name={team.name}
                orgId={team.orgId}
                orgName={team.org?.name}
                parentTeamId={team.parentTeamId}
                parentName={team.parentTeam?.name}
                academyCount={team.academyTeams.length}
              />
            </div>
          </section>
          <TeamManagerCard
            leadership={team.leadership}
            manager={team.manager}
          />
          <section className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-zinc-500">Langue</p>
            <div className="mt-2">
              <LanguageBadges languages={[team.language]} size="lg" />
            </div>
          </section>
          <FairPlayBadge index={fairPlay} />
          <div className="flex flex-col gap-2">
            {canContactTeam && session ? (
              <ContactTeamButton
                teamId={team.id}
                teamName={teamDisplayName(team.name, team.org?.tag)}
                currentUserId={session.user.id}
              />
            ) : null}
            {showPlanning ? (
              <Link href={`/teams/${team.id}/planning`} className="hud-btn-ghost w-fit">
                Planning de l&apos;équipe
              </Link>
            ) : null}
            {canReportTeam ? (
              <ReportButton
                targetType="TEAM"
                targetId={team.id}
                label="Signaler cette équipe"
              />
            ) : null}
          </div>
        </aside>
        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Roster</h2>
            <div className="mt-4">
              <PlayerList
                players={team.players}
                memberships={team.memberships}
                openPositions={openPositions}
                currentUserId={session?.user.id ?? null}
                managerId={team.managerId}
              />
            </div>
          </section>
          {team.org ? <StaffRoster staff={team.org.staff} /> : null}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Fair-play</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <FairPlayIndexCard index={fairPlay} />
              <p className="text-sm text-zinc-500">
                Cette note agrège les évaluations déposées à la fin d&apos;un
                rapport de scrim. Le détail des maps reste privé au staff.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
