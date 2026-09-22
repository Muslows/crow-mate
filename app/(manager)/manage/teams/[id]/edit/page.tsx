import { InvitePlayerForm } from "@/components/invitations/InvitePlayerForm";
import { PlayerList } from "@/components/players/PlayerList";
import { DeleteTeamButton } from "@/components/teams/DeleteTeamButton";
import { DesignateManagersForm } from "@/components/teams/DesignateManagersForm";
import { TeamForm } from "@/components/teams/TeamForm";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { TeamSettingsSheet } from "@/components/teams/TeamSettingsSheet";
import { AffiliationBadge } from "@/components/teams/AffiliationBadge";
import { OpenPositionsBoard } from "@/components/teams/OpenPositionsBoard";
import { TeamTimeSlotsForm } from "@/components/teams/TeamTimeSlotsForm";
import { canEditTeamPermissions, canManageOpenPositions } from "@/lib/access";
import { listTeamTimeSlots } from "@/lib/data/availability";
import { findPlayersForOpenPosition, listOpenPositionsForTeam } from "@/lib/data/open-positions";
import { listTeamStaffGrants } from "@/lib/data/staff-permissions";
import { StaffPermissionsForm } from "@/components/teams/StaffPermissionsForm";
import { getOwnedTeam } from "@/lib/data/teams";
import { getTeamInvitations } from "@/lib/data/invitations";
import { requireManagerSession, sessionRole } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";
import { labelFor, PLATFORMS } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ settings?: string; poste?: string }>;
}) {
  const session = await requireManagerSession();
  const { id } = await params;
  const { settings, poste } = await searchParams;
  const team = await getOwnedTeam(id, session.user.id, sessionRole(session));
  if (!team) notFound();
  const invitations = await getTeamInvitations(team.id);
  const starters = team.players.filter((player) => player.status === "STARTER").length;
  const canEditGrants = await canEditTeamPermissions(team.id, session.user.id);
  const staffGrants = canEditGrants ? await listTeamStaffGrants(team.id) : [];
  const canPositions = await canManageOpenPositions(team.id, session.user.id);
  const timeSlots = await listTeamTimeSlots(team.id);
  const positions = canPositions ? await listOpenPositionsForTeam(team.id) : [];
  const selected = positions.find((item) => item.id === poste) ?? null;
  const matches = selected
    ? await findPlayersForOpenPosition({
        teamId: team.id,
        language: team.language,
        estimatedSr: team.estimatedSr,
        role: selected.role,
        managerId: team.managerId,
      })
    : [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
            Équipe
          </p>
          <h1 className="text-3xl font-semibold uppercase tracking-wide">
            {teamDisplayName(team.name, team.org?.tag)}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <AffiliationBadge
              name={team.name}
              orgId={team.orgId}
              orgName={team.org?.name}
              parentTeamId={team.parentTeamId}
              parentName={team.parentTeam?.name}
              academyCount={team.academyTeams.length}
            />
            <span className="font-mono text-sm text-zinc-400">
              {labelFor(PLATFORMS, team.platform)} · {team.players.length} joueur
              {team.players.length > 1 ? "s" : ""} · {starters} titulaire
              {starters > 1 ? "s" : ""} ·{" "}
              {team.estimatedSr <= 0 ? "SR à définir" : `${team.estimatedSr} SR`}
            </span>
          </div>
          <TeamOpsLinks teamId={team.id} current="roster" />
        </div>
        <TeamSettingsSheet defaultOpen={settings === "1"}>
          <section>
            <h3 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
              Identité et affiliation
            </h3>
            <TeamForm mode="edit" team={team} />
          </section>
          <section>
            <h3 className="mb-2 text-sm uppercase tracking-[0.16em] text-cyan-400">
              Direction
            </h3>
            <p className="mb-4 text-sm text-zinc-400">
              {team.leadership === "CAPTAIN"
                ? "Capitaine : le manager principal est aussi joueur du roster."
                : "Manager pur : les sièges de gestion ne peuvent pas jouer dans cette équipe."}
            </p>
            <DesignateManagersForm teamId={team.id} seats={team.seats} />
          </section>
          <section>
            <h3 className="mb-2 text-sm uppercase tracking-[0.16em] text-violet-800 dark:text-violet-300">
              Créneaux officiels
            </h3>
            <TeamTimeSlotsForm teamId={team.id} slots={timeSlots} />
          </section>
          {team.orgId ? (
            <section>
              <h3 className="mb-2 text-sm uppercase tracking-[0.16em] text-cyan-400">
                Staff structure
              </h3>
              <Link href={`/org/${team.orgId}`} className="hud-btn-ghost">
                Ouvrir la structure
              </Link>
            </section>
          ) : null}
          <section>
            <h3 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
              Recrutement
            </h3>
            <InvitePlayerForm
              teams={[
                {
                  id: team.id,
                  name: teamDisplayName(team.name, team.org?.tag),
                },
              ]}
              defaultTeamId={team.id}
            />
            {invitations.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-300">
                {invitations.map((invitation) => (
                  <li key={invitation.id} className="font-mono text-xs">
                    {invitation.invitee.playerProfile?.displayName ||
                      invitation.invitee.name}{" "}
                    · {invitation.kind === "COACH" ? "Coach" : "Joueur"} ·{" "}
                    {invitation.status}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
          <section>
            <h3 className="mb-4 text-sm uppercase tracking-[0.16em] text-orange-300">
              Zone de danger
            </h3>
            <DeleteTeamButton teamId={team.id} teamName={team.name} />
          </section>
        </TeamSettingsSheet>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
          Roster actif
        </h2>
        <PlayerList teamId={team.id} players={team.players} memberships={team.memberships} editable />
      </section>
      {canPositions ? (
        <OpenPositionsBoard
          teamId={team.id}
          positions={positions}
          selectedId={selected?.id ?? null}
          matches={matches}
          currentUserId={session.user.id}
          estimatedSr={team.estimatedSr}
        />
      ) : null}
      {canEditGrants ? (
        <section className="hud-card flex flex-col gap-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">
            Gestion des droits / permissions
          </h2>
          <p className="text-sm text-zinc-400">
            Seul le manager principal peut accorder ces droits au staff.
          </p>
          <StaffPermissionsForm teamId={team.id} staff={staffGrants} />
        </section>
      ) : null}
    </main>
  );
}
