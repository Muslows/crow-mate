import { isAdmin } from "@/lib/admin";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ensureAppSchema } from "@/lib/schema-ensure";
import type { Platform, SpokenLanguage, UserRole } from "@prisma/client";

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
    memberships: {
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            playerProfile: {
              select: {
                id: true,
                displayName: true,
                battleTagPublic: true,
                sr: true,
                scrimEloTank: true,
                scrimEloDps: true,
                scrimEloSupport: true,
              },
            },
          },
        },
      },
    },
    manager: {
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        isManager: true,
        playerProfile: {
          select: { id: true, displayName: true },
        },
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
  query?: string;
  platform?: Platform;
  language?: SpokenLanguage;
  eloMin?: number;
  eloMax?: number;
};

export async function getPublicTeams(
  filters: TeamListFilters = {},
): Promise<TeamWithPlayers[]> {
  const hasEloBand =
    filters.eloMin !== undefined && filters.eloMax !== undefined;

  await ensureAppSchema(db);
  return db.team.findMany({
    where: {
      ...(filters.query
        ? { name: { contains: filters.query, mode: "insensitive" } }
        : {}),
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...(filters.language ? { language: filters.language } : {}),
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
          OR: [
            { managerId: userId },
            { seats: { some: { userId } } },
            {
              memberships: {
                some: { userId, orgRoles: { has: "MANAGER" } },
              },
            },
          ],
        },
    include: teamWithPlayers.include,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeamWithPlayers(
  id: string,
): Promise<TeamWithPlayers | null> {
  await ensureAppSchema(db);
  const team = await db.team.findUnique({
    where: { id },
    include: teamWithPlayers.include,
  });
  if (!team) return null;
  if (team.manager.playerProfile) return team;

  const playerProfile = await db.playerProfile.upsert({
    where: { userId: team.manager.id },
    create: {
      userId: team.manager.id,
      sr: 0,
      role: "TANK",
      favoriteHeroes: [],
      experience: "",
    },
    update: {},
    select: { id: true, displayName: true },
  });

  return {
    ...team,
    manager: { ...team.manager, playerProfile },
  };
}

export async function getOwnedTeam(
  teamId: string,
  userId: string,
  role: UserRole | string,
): Promise<TeamWithPlayers | null> {
  await ensureAppSchema(db);
  return db.team.findFirst({
    where:
      isAdmin(userId) || role === "ADMIN"
        ? { id: teamId }
        : {
            id: teamId,
            OR: [
              { managerId: userId },
              { seats: { some: { userId } } },
              {
                memberships: {
                  some: { userId, orgRoles: { has: "MANAGER" } },
                },
              },
            ],
          },
    include: teamWithPlayers.include,
  });
}
