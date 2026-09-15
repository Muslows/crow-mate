import Link from "next/link";
import { InvitePlayerForm } from "@/components/invitations/InvitePlayerForm";
import { EnableManagerAccessCard } from "@/components/account/EnableAccessCards";
import { DeleteTeamButton } from "@/components/teams/DeleteTeamButton";
import { getTeamsForManager } from "@/lib/data/teams";
import { averageSr } from "@/lib/elo";
import { labelFor, PLATFORMS } from "@/lib/constants";
import {
  canManageTeams,
  requireAuthSession,
  sessionCapabilities,
  sessionRole,
} from "@/lib/session";
import { Panel } from "@/components/ui/Panel";

export default async function ManagerDashboardPage() {
  const session = await requireAuthSession();
  if (!canManageTeams(sessionCapabilities(session))) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
        <EnableManagerAccessCard />
      </main>
    );
  }

  const teams = await getTeamsForManager(session.user.id, sessionRole(session));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
            Command center
          </p>
          <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
            Mes équipes
          </h1>
        </div>
        <Link href="/manage/teams/new" className="hud-btn">
          Nouvelle équipe
        </Link>
      </div>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Recrutement rapide
        </h2>
        <InvitePlayerForm
          teams={teams.map((team) => ({ id: team.id, name: team.name }))}
        />
      </Panel>
      {teams.length === 0 ? (
        <p className="text-zinc-400">Aucune équipe. Crée ton premier roster.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {teams.map((team) => {
            const sr = averageSr(team.players);
            return (
              <li key={team.id}>
                <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xl font-semibold uppercase">{team.name}</p>
                    <p className="font-mono text-sm text-zinc-400">
                      {labelFor(PLATFORMS, team.platform)} · {team.players.length}{" "}
                      joueur{team.players.length > 1 ? "s" : ""} ·{" "}
                      {sr === null ? "SR à définir" : `${sr} SR`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/teams/${team.id}`} className="hud-btn-ghost">
                      Public
                    </Link>
                    <Link
                      href={`/manage/teams/${team.id}/edit`}
                      className="hud-btn-ghost"
                    >
                      Roster
                    </Link>
                    <DeleteTeamButton teamId={team.id} teamName={team.name} />
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
