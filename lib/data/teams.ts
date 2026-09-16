import { isAdmin } from "@/lib/admin";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Platform, UserRole } from "@prisma/client";

export const teamWithPlayers = Prisma.validator<Prisma.TeamDefaultArgs>()({
  include: {
    org: {
      select: {
        id: true,
        name: true,
        tag: true,
        logoUrl: true,
        staff: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    },
    parentTeam: { select: { id: true, name: true } },
    academyTeams: { select: { id: true } },
    players: {
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
    playerProfile: { select: { id: true, displayName: true, battleTagPublic: true } },
          },
        },
      },
    },
    seats: {
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        kind: true,
        userId: true,
        user: { select: { id: true, name: true } },
      },
    },
    coaches: {
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        user: { select: { id: true, name: true } },
      },
    },
  },
});

export type TeamWithPlayers = Prisma.TeamGetPayload<typeof teamWithPlayers>;

export async function getOpponentTeamOptions(excludeTeamId: string) {
  return db.team.findMany({
    where: { id: { not: excludeTeamId } },
    select: {
      id: true,
      name: true,
      org: { select: { tag: true } },
    },
    orderBy: { name: "asc" },
  });
}

export type TeamListFilters = {
  platform?: Platform;
  eloMin?: number;
  eloMax?: number;
};

export async function getPublicTeams(
  filters: TeamListFilters = {},
): Promise<TeamWithPlayers[]> {
  const hasEloBand =
    filters.eloMin !== undefined && filters.eloMax !== undefined;

  return db.team.findMany({
    where: {
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...(hasEloBand
        ? {
            estimatedSr: {
              gte: filters.eloMin,
              lte: filters.eloMax,
            },
          }
        : {}),
    },
    include: teamWithPlayers.include,
    orderBy: { estimatedSr: "desc" },
  });
}

export async function getTeamsForManager(
  userId: string,
  role: UserRole | string,
): Promise<TeamWithPlayers[]> {
  const seeAll = isAdmin(userId) || role === "ADMIN";
  return db.team.findMany({
    where: seeAll
      ? undefined
      : {
          OR: [{ managerId: userId }, { seats: { some: { userId } } }],
        },
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
      isAdmin(userId) || role === "ADMIN"
        ? { id: teamId }
        : {
            id: teamId,
            OR: [{ managerId: userId }, { seats: { some: { userId } } }],
          },
    include: teamWithPlayers.include,
  });
}
