import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { PlayerList } from "@/components/players/PlayerList";
import { TeamMark } from "@/components/teams/TeamMark";
import { FairPlayIndexCard } from "@/components/teams/FairPlayIndexCard";
import { FairPlayBadge } from "@/components/ui/FairPlayBadge";
import { Panel } from "@/components/ui/Panel";
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

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-48 bg-gradient-to-b from-orange-500/10 to-transparent" />
      <header className="hud-card flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <TeamMark name={team.name} />
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-orange-300">
              Team card · {labelFor(PLATFORMS, team.platform)} ·{" "}
              {labelFor(STRUCTURES, team.structure)}
            </p>
            <h1 className="mt-3 text-4xl font-bold uppercase tracking-wide text-cyan-100 sm:text-5xl">
              {teamDisplayName(team.name, team.org?.tag)}
            </h1>
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
            <p className="mt-3 font-mono text-2xl uppercase tracking-[0.08em] text-orange-300">
              {estimatedSr <= 0
                ? "Niveau estimé à définir"
                : `Niveau estimé ${estimatedSr} SR`}
            </p>
            <div className="mt-3">
              <LanguageBadges languages={[team.language]} size="lg" />
            </div>
            <div className="mt-4 max-w-xs">
              <FairPlayBadge index={fairPlay} />
            </div>
          </div>
        </div>
        {estimatedSr > 0 ? (
          <RankBadge sr={estimatedSr} rank={rankFromSr(estimatedSr)} />
        ) : null}
      </header>
      <div className="flex flex-wrap items-center gap-3">
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
      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
          Roster
        </h2>
        <PlayerList players={team.players} />
      </section>
      {team.org ? (
        <StaffRoster staff={team.org.staff} />
      ) : null}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
          Fair-play index
        </h2>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <FairPlayIndexCard index={fairPlay} />
          <Panel>
            <p className="text-sm text-zinc-400">
              Cette note agrège uniquement les évaluations de comportement
              déposées à la fin d&apos;un rapport de scrim réel. Le détail des
              maps et commentaires reste privé au staff de chaque équipe.
            </p>
          </Panel>
        </div>
      </section>
    </main>
  );
}
