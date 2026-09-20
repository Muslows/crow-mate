import Link from "next/link";
import { RankBadge } from "@/components/ui/RankBadge";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { labelFor, PLAYER_ROLES, ROSTER_STATUSES } from "@/lib/constants";
import { DeletePlayerButton } from "@/components/players/DeletePlayerButton";
import { PlayerForm } from "@/components/players/PlayerForm";
import { OpenPositionVacancyCard } from "@/components/teams/OpenPositionVacancyCard";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { publicDisplayName } from "@/lib/privacy";
import type { PlayerRole, RankDivision, RosterStatus } from "@prisma/client";

type Player = {
  id: string;
  battleTag: string;
  role: PlayerRole;
  sr: number;
  rankDivision: RankDivision;
  status: RosterStatus;
  favoriteHeroes: string[];
  experience: string;
  user?: {
    name?: string | null;
    playerProfile?: {
      id: string;
      displayName?: string | null;
      battleTagPublic?: boolean;
    } | null;
  } | null;
};

function playerHref(player: Player): string {
  return player.user?.playerProfile?.id
    ? `/players/${player.user.playerProfile.id}`
    : `/players/${player.id}`;
}

function PlayerSummary({
  player,
  revealBattleTag,
}: {
  player: Player;
  revealBattleTag: boolean;
}) {
  const handle = revealBattleTag
    ? player.battleTag
    : publicDisplayName({
        displayName: player.user?.playerProfile?.displayName,
        name: player.user?.name,
      });
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold text-foreground">{handle}</p>
        <RoleBadge role={player.role} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RankBadge rank={player.rankDivision} />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{player.sr} SR</span>
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
  openPositions = [],
  currentUserId = null,
  managerId,
}: {
  teamId?: string;
  players: Player[];
  editable?: boolean;
  openPositions?: { id: string; role: PlayerRole }[];
  currentUserId?: string | null;
  managerId?: string;
}) {
  const roleOrder = PLAYER_ROLES.map((item) => item.value);
  const playersByRole = new Map<PlayerRole, Player[]>();
  for (const player of players) {
    const bucket = playersByRole.get(player.role) ?? [];
    bucket.push(player);
    playersByRole.set(player.role, bucket);
  }
  const vacancies = editable
    ? []
    : [...openPositions].sort(
        (left, right) =>
          roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role),
      );
  const rosterItems: (
    | { kind: "player"; player: Player }
    | { kind: "vacancy"; position: { id: string; role: PlayerRole } }
  )[] = [];
  for (const role of roleOrder) {
    for (const player of playersByRole.get(role) ?? []) {
      rosterItems.push({ kind: "player", player });
    }
    for (const position of vacancies.filter((item) => item.role === role)) {
      rosterItems.push({ kind: "vacancy", position });
    }
  }

  if (rosterItems.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Roster vide. Invite un joueur déjà inscrit (Player ID).
      </p>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {rosterItems.map((item) => {
        if (item.kind === "vacancy") {
          return (
            <li key={item.position.id}>
              <OpenPositionVacancyCard
                positionId={item.position.id}
                role={item.position.role}
                currentUserId={currentUserId}
                managerId={managerId ?? ""}
              />
            </li>
          );
        }
        const player = item.player;
        const revealBattleTag = Boolean(
          player.user?.playerProfile?.battleTagPublic,
        );
        return (
          <li key={player.id}>
            <Panel>
              <div className="flex flex-col gap-3">
                {editable ? (
                  <PlayerSummary player={player} revealBattleTag={revealBattleTag} />
                ) : (
                  <Link
                    href={playerHref(player)}
                    className="flex flex-col gap-3 transition hover:border-orange-400/40"
                  >
                    <PlayerSummary player={player} revealBattleTag={revealBattleTag} />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
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
                        Statut roster
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
        );
      })}
    </ul>
  );
}
