import Link from "next/link";
import { CreateTeamAccessCard } from "@/components/account/EnableAccessCards";
import { getTeamsForManager } from "@/lib/data/teams";
import { getTeamWeekHighlights } from "@/lib/data/availability";
import { labelFor, PLATFORMS } from "@/lib/constants";
import {
  canManageTeams,
  requireAuthSession,
  sessionCapabilities,
  sessionRole,
} from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";
import { AffiliationBadge } from "@/components/teams/AffiliationBadge";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { publicDisplayName } from "@/lib/privacy";
import { StructureInviteInbox } from "@/components/structures/StructureInviteInbox";
import { ClubInviteInbox } from "@/components/teams/ClubInviteInbox";
import { getIncomingScrimProposals } from "@/lib/data/proposals";
import { ScrimProposalInbox } from "@/components/scrims/ScrimProposalInbox";
import {
  getPendingClubInvitesForManager,
  getPendingStructureInvitesForManager,
} from "@/lib/data/structures";

export default async function ManagerDashboardPage() {
  const session = await requireAuthSession();
  if (!canManageTeams(sessionCapabilities(session))) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
        <CreateTeamAccessCard />
      </main>
    );
  }

  const teams = await getTeamsForManager(session.user.id, sessionRole(session));
  const highlights = await getTeamWeekHighlights(teams.map((team) => team.id));
  const structureInvites = await getPendingStructureInvitesForManager(
    session.user.id,
  );
  const clubInvites = await getPendingClubInvitesForManager(session.user.id);
  const scrimProposals = await getIncomingScrimProposals(session.user.id);
  const pendingCount = structureInvites.length + clubInvites.length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Command center</p>
          <h1 className="mt-2 text-4xl font-bold uppercase tracking-wide">
            Mes équipes
          </h1>
        </div>
        <Link href="/manage/teams/new" className="hud-btn">
          Nouvelle équipe
        </Link>
      </div>
      <ScrimProposalInbox proposals={scrimProposals} />
      {pendingCount > 0 ? (
        <details className="hud-card p-4">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Demandes ({pendingCount})
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            <StructureInviteInbox invitations={structureInvites} />
            <ClubInviteInbox invitations={clubInvites} />
          </div>
        </details>
      ) : null}
      {teams.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">Aucune équipe. Crée ton premier roster.</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {teams.map((team) => {
            const starters = team.players.filter(
              (player) => player.status === "STARTER",
            );
            const nextSlots = highlights.get(team.id) ?? [];
            return (
              <li key={team.id}>
                <article className="hud-card flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/manage/teams/${team.id}/edit`} className="min-w-0">
                      <p className="text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                        {teamDisplayName(team.name, team.org?.tag)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <AffiliationBadge
                          name={team.name}
                          orgId={team.orgId}
                          orgName={team.org?.name}
                          parentTeamId={team.parentTeamId}
                          parentName={team.parentTeam?.name}
                          academyCount={team.academyTeams.length}
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {labelFor(PLATFORMS, team.platform)} · {starters.length}{" "}
                          titulaire{starters.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </Link>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      {team.estimatedSr > 0 ? `${team.estimatedSr} SR` : "SR —"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {team.players.slice(0, 5).map((player) => (
                      <li
                        key={player.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="truncate text-zinc-800 dark:text-zinc-200">
                          {publicDisplayName({
                            displayName: player.user?.playerProfile?.displayName,
                            name: player.user?.name ?? player.battleTag,
                          })}
                        </span>
                        <RoleBadge role={player.role} compact />
                      </li>
                    ))}
                  </ul>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                      Prochains scrims
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {nextSlots.length > 0
                        ? nextSlots.join(" · ")
                        : "Aucun créneau validé cette semaine"}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/manage/teams/${team.id}/edit`}
                      className="hud-btn-ghost"
                    >
                      Roster
                    </Link>
                    <Link
                      href={`/manage/teams/${team.id}/planning`}
                      className="hud-btn-ghost"
                    >
                      Planning
                    </Link>
                    <Link
                      href={`/manage/teams/${team.id}/scrims`}
                      className="hud-btn-ghost"
                    >
                      Scrims
                    </Link>
                    <Link
                      href={`/manage/teams/${team.id}/find`}
                      className="hud-btn-ghost"
                    >
                      Trouver un scrim
                    </Link>
                    <Link
                      href={`/manage/teams/${team.id}/edit?settings=1`}
                      className="hud-btn-ghost"
                    >
                      Admin
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
