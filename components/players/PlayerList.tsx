import Link from "next/link";
import { RankBadge } from "@/components/ui/RankBadge";
import { labelFor, PLAYER_ROLES, ROSTER_STATUSES } from "@/lib/constants";
import { DeletePlayerButton } from "@/components/players/DeletePlayerButton";
import { PlayerForm } from "@/components/players/PlayerForm";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import type { PlayerRole, RankDivision, RosterStatus } from "@prisma/client";

type Player = {
  id: string;
  battleTag: string;
  role: PlayerRole;
  secondaryRole: PlayerRole | null;
  sr: number;
  rankDivision: RankDivision;
  status: RosterStatus;
  favoriteHeroes: string[];
  experience: string;
  user?: { playerProfile?: { id: string } | null } | null;
};

function roleTone(role: PlayerRole): "cyan" | "orange" | "green" {
  if (role === "TANK") return "cyan";
  if (role === "DPS") return "orange";
  return "green";
}

function playerHref(player: Player): string {
  return player.user?.playerProfile?.id
    ? `/players/${player.user.playerProfile.id}`
    : `/players/${player.id}`;
}

function PlayerSummary({ player }: { player: Player }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-lg text-cyan-100">{player.battleTag}</p>
        <Badge tone={roleTone(player.role)}>
          {labelFor(PLAYER_ROLES, player.role)}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RankBadge rank={player.rankDivision} />
        <span className="font-mono text-sm text-zinc-400">{player.sr} SR</span>
      </div>
      <Badge tone={player.status === "STARTER" ? "orange" : "muted"}>
        {labelFor(ROSTER_STATUSES, player.status)}
      </Badge>
    </>
  );
}

export function PlayerList({
  teamId,
  players,
  editable = false,
}: {
  teamId?: string;
  players: Player[];
  editable?: boolean;
}) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Roster vide. Ajoute un joueur.</p>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {players.map((player) => (
        <li key={player.id}>
          <Panel>
            <div className="flex flex-col gap-3">
              {editable ? (
                <PlayerSummary player={player} />
              ) : (
                <Link
                  href={playerHref(player)}
                  className="flex flex-col gap-3 transition hover:border-orange-400/40"
                >
                  <PlayerSummary player={player} />
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-orange-300">
                    Ouvrir la fiche
                  </span>
                </Link>
              )}
              {editable && teamId ? (
                <>
                  <Link
                    href={playerHref(player)}
                    className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-400 hover:text-orange-300"
                  >
                    Fiche publique
                  </Link>
                  <details className="border-t border-cyan-400/15 pt-3">
                    <summary className="cursor-pointer text-xs uppercase tracking-[0.16em] text-cyan-400">
                      Éditer
                    </summary>
                    <div className="mt-3 flex flex-col gap-3">
                      <PlayerForm teamId={teamId} player={player} />
                      <DeletePlayerButton playerId={player.id} teamId={teamId} />
                    </div>
                  </details>
                </>
              ) : null}
            </div>
          </Panel>
        </li>
      ))}
    </ul>
  );
}
