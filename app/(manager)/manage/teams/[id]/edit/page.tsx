import { InvitePlayerForm } from "@/components/invitations/InvitePlayerForm";
import { PlayerForm } from "@/components/players/PlayerForm";
import { PlayerList } from "@/components/players/PlayerList";
import { DeleteTeamButton } from "@/components/teams/DeleteTeamButton";
import { TeamForm } from "@/components/teams/TeamForm";
import { Panel } from "@/components/ui/Panel";
import { getOwnedTeam } from "@/lib/data/teams";
import { getTeamInvitations } from "@/lib/data/invitations";
import { requireManagerSession, sessionRole } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireManagerSession();
  const { id } = await params;
  const team = await getOwnedTeam(id, session.user.id, sessionRole(session));
  if (!team) notFound();
  const invitations = await getTeamInvitations(team.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
            Gestion roster
          </p>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide">
            {team.name}
          </h1>
        </div>
        <DeleteTeamButton teamId={team.id} teamName={team.name} />
      </div>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Identité
        </h2>
        <TeamForm mode="edit" team={team} />
      </Panel>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
          Roster
        </h2>
        <PlayerList teamId={team.id} players={team.players} editable />
      </section>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Inviter par Player ID
        </h2>
        <InvitePlayerForm
          teams={[{ id: team.id, name: team.name }]}
          defaultTeamId={team.id}
        />
        {invitations.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-2 text-sm text-zinc-300">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="font-mono text-xs">
                {invitation.invitee.playerProfile?.battleTag ||
                  invitation.invitee.name}{" "}
                · {invitation.status}
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Ajouter un joueur
        </h2>
        <PlayerForm teamId={team.id} />
      </Panel>
    </main>
  );
}
