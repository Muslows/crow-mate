import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Platform, UserRole } from "@prisma/client";
import { averageSr } from "@/lib/elo";
import { SR_MAX, SR_MIN } from "@/lib/rank";

export const teamWithPlayers = Prisma.validator<Prisma.TeamDefaultArgs>()({
  include: {
    players: {
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { playerProfile: { select: { id: true } } } },
      },
    },
  },
});

export type TeamWithPlayers = Prisma.TeamGetPayload<typeof teamWithPlayers>;

export type TeamListFilters = {
  platform?: Platform;
  eloMin?: number;
  eloMax?: number;
};

export async function getPublicTeams(
  filters: Pick<TeamListFilters, "platform"> = {},
): Promise<TeamWithPlayers[]> {
  return db.team.findMany({
    where: filters.platform ? { platform: filters.platform } : undefined,
    include: teamWithPlayers.include,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeamsForManager(
  userId: string,
  role: UserRole | string,
): Promise<TeamWithPlayers[]> {
  return db.team.findMany({
    where: role === "ADMIN" ? undefined : { managerId: userId },
    include: teamWithPlayers.include,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeamWithPlayers(
  id: string,
): Promise<TeamWithPlayers | null> {
  return db.team.findUnique({
    where: { id },
    include: teamWithPlayers.include,
  });
}

export async function getOwnedTeam(
  teamId: string,
  userId: string,
  role: UserRole | string,
): Promise<TeamWithPlayers | null> {
  return db.team.findFirst({
    where:
      role === "ADMIN"
        ? { id: teamId }
        : { id: teamId, managerId: userId },
    include: teamWithPlayers.include,
  });
}

export function filterTeamsByPublicQuery(
  teams: TeamWithPlayers[],
  filters: TeamListFilters,
): TeamWithPlayers[] {
  const skipSr =
    (filters.eloMin === undefined || filters.eloMin <= SR_MIN) &&
    (filters.eloMax === undefined || filters.eloMax >= SR_MAX);

  return teams.filter((team) => {
    if (filters.platform && team.platform !== filters.platform) return false;
    if (skipSr) return true;
    const sr = averageSr(team.players);
    if (filters.eloMin !== undefined) {
      if (sr === null || sr < filters.eloMin) return false;
    }
    if (filters.eloMax !== undefined) {
      if (sr === null || sr > filters.eloMax) return false;
    }
    return true;
  });
}
