import Link from "next/link";
import { RankBadge } from "@/components/ui/RankBadge";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { labelFor, PLAYER_ROLES, ROSTER_STATUSES } from "@/lib/constants";
import { DeletePlayerButton } from "@/components/players/DeletePlayerButton";
import { MembershipRolesForm } from "@/components/players/MembershipRolesForm";
import { PlayerForm } from "@/components/players/PlayerForm";
import { OpenPositionVacancyCard } from "@/components/teams/OpenPositionVacancyCard";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { publicDisplayName } from "@/lib/privacy-display";
import { rosterDualLabel } from "@/lib/team-membership";
import type {
  PlayerRole,
  RankDivision,
  RosterStatus,
  TeamOrgRole,
} from "@prisma/client";

type Player = {
  id: string;
  battleTag: string;
  role: PlayerRole;
  sr: number;
  rankDivision: RankDivision;
  status: RosterStatus;
  favoriteHeroes: string[];
  experience: string;
  userId?: string | null;
  user?: {
    id?: string;
    name?: string | null;
    playerProfile?: {
      id: string;
      displayName?: string | null;
      battleTagPublic?: boolean;
    } | null;
  } | null;
};

export type RosterMembership = {
  id: string;
  userId: string;
  playerRole: PlayerRole | null;
  orgRoles: TeamOrgRole[];
  user: {
    id: string;
    name: string;
    playerProfile?: {
      id: string;
      displayName?: string | null;
      battleTagPublic?: boolean;
      sr?: number;
    } | null;
  };
};

type RosterCard = {
  key: string;
  handle: string;
  playerRole: PlayerRole | null;
  orgRoles: TeamOrgRole[];
  dualLabel: string;
  sr: number;
  rankDivision?: RankDivision;
  status?: RosterStatus;
  playerId?: string;
  membershipId?: string;
  profileId?: string;
  battleTagPublic: boolean;
};

function playerHref(card: RosterCard): string {
  return card.profileId ? `/players/${card.profileId}` : `/players/${card.playerId}`;
}

function mergeRoster(players: Player[], memberships: RosterMembership[]): RosterCard[] {
  const cards = new Map<string, RosterCard>();

  for (const membership of memberships) {
    const player = players.find((item) => item.userId === membership.userId);
    const playerRole = membership.playerRole ?? player?.role ?? null;
    cards.set(membership.userId, {
      key: membership.id,
      handle: publicDisplayName({
        displayName: membership.user.playerProfile?.displayName,
        name: membership.user.name,
      }),
      playerRole,
      orgRoles: membership.orgRoles,
      dualLabel: rosterDualLabel({
        orgRoles: membership.orgRoles,
        playerRole,
        playerRoleLabel: playerRole ? labelFor(PLAYER_ROLES, playerRole) : null,
      }),
      sr: player?.sr ?? membership.user.playerProfile?.sr ?? 0,
      rankDivision: player?.rankDivision,
      status: player?.status,
      playerId: player?.id,
      membershipId: membership.id,
      profileId: membership.user.playerProfile?.id,
      battleTagPublic: Boolean(membership.user.playerProfile?.battleTagPublic),
    });
  }

  for (const player of players) {
    const userId = player.userId ?? player.user?.id;
    if (userId && cards.has(userId)) continue;
    const handle = publicDisplayName({
      displayName: player.user?.playerProfile?.displayName,
      name: player.user?.name,
    });
    cards.set(player.id, {
      key: player.id,
      handle: handle || player.battleTag,
      playerRole: player.role,
      orgRoles: ["PLAYER"],
      dualLabel: rosterDualLabel({
        orgRoles: ["PLAYER"],
        playerRole: player.role,
        playerRoleLabel: labelFor(PLAYER_ROLES, player.role),
      }),
      sr: player.sr,
      rankDivision: player.rankDivision,
      status: player.status,
      playerId: player.id,
      profileId: player.user?.playerProfile?.id,
      battleTagPublic: Boolean(player.user?.playerProfile?.battleTagPublic),
    });
  }

  return Array.from(cards.values());
}

function MemberSummary({ card }: { card: RosterCard }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold text-foreground">{card.handle}</p>
        {card.playerRole ? <RoleBadge role={card.playerRole} /> : null}
      </div>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {card.dualLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {card.rankDivision ? <RankBadge rank={card.rankDivision} /> : null}
        {card.sr > 0 ? (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {card.sr} SR
          </span>
        ) : null}
      </div>
      {card.status ? (
        <Badge tone={card.status === "STARTER" ? "orange" : "muted"}>
          {labelFor(ROSTER_STATUSES, card.status)}
        </Badge>
      ) : null}
    </>
  );
}

export function PlayerList({
  teamId,
  players,
  memberships = [],
  editable = false,
  openPositions = [],
  currentUserId = null,
  managerId,
}: {
  teamId?: string;
  players: Player[];
  memberships?: RosterMembership[];
  editable?: boolean;
  openPositions?: { id: string; role: PlayerRole }[];
  currentUserId?: string | null;
  managerId?: string;
}) {
  const roleOrder = PLAYER_ROLES.map((item) => item.value);
  const cards = mergeRoster(players, memberships);
  const byRole = new Map<PlayerRole | "STAFF", RosterCard[]>();
  for (const card of cards) {
    const bucket = card.playerRole ?? "STAFF";
    const list = byRole.get(bucket) ?? [];
    list.push(card);
    byRole.set(bucket, list);
  }
  const vacancies = editable
    ? []
    : [...openPositions].sort(
        (left, right) =>
          roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role),
      );
  const rosterItems: (
    | { kind: "member"; card: RosterCard }
    | { kind: "vacancy"; position: { id: string; role: PlayerRole } }
  )[] = [];
  for (const role of roleOrder) {
    for (const card of byRole.get(role) ?? []) {
      rosterItems.push({ kind: "member", card });
    }
    for (const position of vacancies.filter((item) => item.role === role)) {
      rosterItems.push({ kind: "vacancy", position });
    }
  }
  for (const card of byRole.get("STAFF") ?? []) {
    rosterItems.push({ kind: "member", card });
  }

  if (rosterItems.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Roster vide. Invite un utilisateur déjà inscrit (Player ID).
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
        const card = item.card;
        return (
          <li key={card.key}>
            <Panel>
              <div className="flex flex-col gap-3">
                {editable || !card.profileId ? (
                  <MemberSummary card={card} />
                ) : (
                  <Link
                    href={playerHref(card)}
                    className="flex flex-col gap-3 transition hover:border-orange-400/40"
                  >
                    <MemberSummary card={card} />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                      Ouvrir la fiche
                    </span>
                  </Link>
                )}
                {editable && teamId ? (
                  <>
                    {card.profileId || card.playerId ? (
                      <Link
                        href={playerHref(card)}
                        className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-700 hover:text-orange-700 dark:text-cyan-400 dark:hover:text-orange-300"
                      >
                        Fiche publique
                      </Link>
                    ) : null}
                    {card.membershipId ? (
                      <details className="border-t border-zinc-200 pt-3 dark:border-cyan-400/15">
                        <summary className="cursor-pointer text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                          Rôles in-game et staff
                        </summary>
                        <div className="mt-3">
                          <MembershipRolesForm
                            teamId={teamId}
                            membershipId={card.membershipId}
                            playerRole={card.playerRole}
                            orgRoles={card.orgRoles}
                          />
                        </div>
                      </details>
                    ) : null}
                    {card.playerId ? (
                      <details className="border-t border-zinc-200 pt-3 dark:border-cyan-400/15">
                        <summary className="cursor-pointer text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                          Statut roster
                        </summary>
                        <div className="mt-3 flex flex-col gap-3">
                          <PlayerForm
                            teamId={teamId}
                            player={{ id: card.playerId, status: card.status ?? "TRIAL" }}
                          />
                          <DeletePlayerButton playerId={card.playerId} teamId={teamId} />
                        </div>
                      </details>
                    ) : null}
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
