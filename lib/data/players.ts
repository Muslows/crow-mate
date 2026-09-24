import type { Prisma, SpokenLanguage } from "@prisma/client";
import { db } from "@/lib/db";
import {
  openPlayWhere,
  type OpenPlayRole,
} from "@/lib/data/filters";

export type PublicPlayerFilters = {
  query?: string;
  eloMin?: number;
  eloMax?: number;
  languages?: SpokenLanguage[];
  openRoles?: OpenPlayRole[];
};

export async function getPublicPlayers(filters: PublicPlayerFilters = {}) {
  const query = filters.query?.trim();
  const languages = filters.languages ?? [];
  const openRoles = filters.openRoles ?? [];
  const hasEloBand =
    filters.eloMin !== undefined && filters.eloMax !== undefined;

  const where: Prisma.PlayerProfileWhereInput = {
    AND: [
      ...(hasEloBand
        ? [
            {
              sr: {
                gte: filters.eloMin,
                lte: filters.eloMax,
              },
            },
          ]
        : []),
      ...(languages.length > 0 ? [{ languages: { hasSome: languages } }] : []),
      ...openPlayWhere(openRoles),
      ...(query
        ? [
            {
              OR: [
                { displayName: { contains: query, mode: "insensitive" as const } },
                { user: { name: { contains: query, mode: "insensitive" as const } } },
              ],
            },
          ]
        : []),
    ],
  };

  return db.playerProfile.findMany({
    where,
    select: {
      id: true,
      displayName: true,
      battleTag: true,
      battleTagPublic: true,
      sr: true,
      role: true,
      openToPlay: true,
      languages: true,
      recruitmentStatus: true,
      user: {
        select: {
          id: true,
          name: true,
          isCoach: true,
          isCaster: true,
          isStaff: true,
          openToCast: true,
          openToCoach: true,
          rosterSlots: {
            where: { team: { isNot: null } },
            select: {
              id: true,
              team: {
                select: { id: true, name: true, language: true, platform: true, org: { select: { tag: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: { sr: "desc" },
  }).then((players) => {
    if (!query) return players;
    const needle = query.toLowerCase();
    return [...players].sort((left, right) => {
      const rank = (value: {
        displayName: string;
        user: { name: string };
      }) => {
        if (value.displayName.toLowerCase().includes(needle)) return 0;
        if (value.user.name.toLowerCase().includes(needle)) return 1;
        return 2;
      };
      const diff = rank(left) - rank(right);
      if (diff !== 0) return diff;
      return right.sr - left.sr;
    });
  });
}

export async function getPublicPlayerById(id: string) {
  return db.player.findUnique({
    where: { id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          platform: true,
          structure: true,
          org: { select: { tag: true, name: true } },
          language: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          playerProfile: { select: { id: true, displayName: true, battleTagPublic: true } },
        },
      },
    },
  });
}

export type PublicPlayerCard = Awaited<
  ReturnType<typeof getPublicPlayers>
>[number];
