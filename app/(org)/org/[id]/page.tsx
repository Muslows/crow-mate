import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteTeamForm, DetachTeamButton } from "@/components/structures/InviteTeamForm";
import { StructureMark } from "@/components/structures/StructureMark";
import { StaffManageForm, AssignManagerForm } from "@/components/structures/StaffManageForm";
import { StructureInviteInbox } from "@/components/structures/StructureInviteInbox";
import { Panel } from "@/components/ui/Panel";
import { labelFor, PLATFORMS } from "@/lib/constants";
import { getStructureWorkspace } from "@/lib/data/structures";
import {
  isAdminRole,
  requireAuthSession,
  sessionCapabilities,
} from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";

export default async function OrgStructurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const workspace = await getStructureWorkspace(
    id,
    session.user.id,
    isAdminRole(sessionCapabilities(session)),
  );
  if (!workspace) notFound();
  const { structure, canManage } = workspace;
  const inboundRequests = structure.invitations.filter((invite) => invite.requestedByTeam);
  const outboundInvites = structure.invitations.filter((invite) => !invite.requestedByTeam);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <StructureMark
            tag={structure.tag}
            name={structure.name}
            logoUrl={structure.logoUrl}
          />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
              {structure.tag}
            </p>
            <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide">
              {structure.name}
            </h1>
            <p className="mt-2 font-mono text-sm text-zinc-400">
              Owner {structure.owner.name}
            </p>
          </div>
        </div>
        <Link href="/org" className="hud-btn-ghost">
          Toutes les structures
        </Link>
      </div>
      {canManage ? (
        <StructureInviteInbox
          perspective="owner"
          invitations={inboundRequests.map((invite) => ({
            id: invite.id,
            structure: { name: structure.name, tag: structure.tag },
            team: invite.team,
          }))}
        />
      ) : null}
      {canManage ? (
        <Panel>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
            Inviter une équipe par Team ID
          </h2>
          <InviteTeamForm structureId={structure.id} />
          {outboundInvites.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-2 font-mono text-xs text-zinc-400">
              {outboundInvites.map((invite) => (
                <li key={invite.id}>
                  En attente · {invite.team.name} ({invite.team.id})
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      ) : null}
      {canManage ? (
        <Panel>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
            Staff technique
          </h2>
          <StaffManageForm structureId={structure.id} staff={structure.staff} />
        </Panel>
      ) : (
        <Panel>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
            Staff technique
          </h2>
          {structure.staff.length === 0 ? (
            <p className="text-sm text-zinc-400">Aucun staff configuré.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {structure.staff.map((member) => (
                <li key={member.id}>
                  {member.user.name} · {member.role}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
          Équipes de la structure
        </h2>
        {structure.teams.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aucune équipe rattachée. Le tag {structure.tag} restera prêt.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {structure.teams.map((team) => (
              <li key={team.id}>
                <Panel className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold uppercase">
                        {teamDisplayName(team.name, structure.tag)}
                      </p>
                      <p className="font-mono text-sm text-zinc-400">
                        {labelFor(PLATFORMS, team.platform)} · Manager{" "}
                        {team.manager.name}
                        {team.estimatedSr > 0
                          ? ` · ${team.estimatedSr} SR`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/teams/${team.id}`} className="hud-btn-ghost">
                        Public
                      </Link>
                      <Link
                        href={`/teams/${team.id}/planning`}
                        className="hud-btn-ghost"
                      >
                        Planning
                      </Link>
                      {canManage ? (
                        <DetachTeamButton
                          structureId={structure.id}
                          teamId={team.id}
                        />
                      ) : null}
                    </div>
                  </div>
                  {canManage ? (
                    <AssignManagerForm
                      structureId={structure.id}
                      teamId={team.id}
                    />
                  ) : null}
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
