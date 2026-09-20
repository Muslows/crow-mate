import { notFound } from "next/navigation";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { FindScrimBoard } from "@/components/scrims/FindScrimBoard";
import { LfScrimForm } from "@/components/scrims/AnnouncementForms";
import { AnnouncementList } from "@/components/scrims/AnnouncementList";
import { canProposeTeamScrim } from "@/lib/access";
import { getActiveAnnouncementsForTeam, getActiveLfsAnnouncements } from "@/lib/data/announcements";
import { findScrimMatches } from "@/lib/data/scrim-match";
import { getOutgoingScrimProposals } from "@/lib/data/proposals";
import { getTeamWithPlayers } from "@/lib/data/teams";
import { lfsHeadlineForSelection } from "@/lib/lfs";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";
import { isValidTolerance } from "@/lib/scrim-slots";
import { formatWeekRange, weekStartForOffset } from "@/lib/week";

export default async function FindScrimPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tol?: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const { tol } = await searchParams;
  const allowed = await canProposeTeamScrim(id, session.user.id);
  if (!allowed) notFound();
  const team = await getTeamWithPlayers(id);
  if (!team) notFound();

  const parsed = Number.parseInt(tol ?? "200", 10);
  const tolerance = isValidTolerance(parsed) ? parsed : 200;
  const weekStartIso = weekStartForOffset(0);
  const [result, outgoing, lfScrims, teamAnnouncements] = await Promise.all([
    findScrimMatches({
      teamId: team.id,
      weekStartIso,
      tolerance,
    }),
    getOutgoingScrimProposals(team.id),
    getActiveLfsAnnouncements(),
    getActiveAnnouncementsForTeam(team.id),
  ]);
  const lfsPreview = lfsHeadlineForSelection({
    region: "EU",
    platform: "PC",
    estimatedSr: team.estimatedSr,
    weekday: "monday",
    startHour: 21,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="section-kicker">Matchmaking scrims</p>
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          Trouver un scrim
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {teamDisplayName(team.name, team.org?.tag)} · semaine du{" "}
          {formatWeekRange(weekStartIso)}
        </p>
        <TeamOpsLinks teamId={team.id} current="find" />
      </div>
      <LfScrimForm
        teamId={team.id}
        teamName={teamDisplayName(team.name, team.org?.tag)}
        estimatedSr={team.estimatedSr}
        initialHeadline={lfsPreview.headline}
        initialExpiresLabel={lfsPreview.expiresAt.toLocaleString("fr-FR", {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        })}
      />
      <AnnouncementList
        title="Tes annonces actives"
        empty="Aucune annonce LFS ou LFP en cours pour cette équipe."
        items={teamAnnouncements}
        currentUserId={session.user.id}
        moderateTeamId={team.id}
      />
      <AnnouncementList
        title="LFS encore valides"
        empty="Aucun LFS actif."
        items={lfScrims}
        currentUserId={session.user.id}
        filterable
        moderateTeamId={team.id}
      />
      {outgoing.length > 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {outgoing.length} proposition{outgoing.length > 1 ? "s" : ""} déjà
          envoyée{outgoing.length > 1 ? "s" : ""} en attente.
        </p>
      ) : null}
      <FindScrimBoard
        teamId={team.id}
        weekStartDate={weekStartIso}
        initialTolerance={tolerance}
        initialResult={result}
      />
    </main>
  );
}
