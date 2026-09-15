import type { Prisma, SpokenLanguage } from "@prisma/client";
import { db } from "@/lib/db";

export type PublicPlayerFilters = {
  query?: string;
  eloMin?: number;
  eloMax?: number;
  languages?: SpokenLanguage[];
};

export async function getPublicPlayers(filters: PublicPlayerFilters = {}) {
  const query = filters.query?.trim();
  const languages = filters.languages ?? [];

  const where: Prisma.PlayerProfileWhereInput = {
    AND: [
      ...(filters.eloMin !== undefined || filters.eloMax !== undefined
        ? [
            {
              sr: {
                ...(filters.eloMin !== undefined ? { gte: filters.eloMin } : {}),
                ...(filters.eloMax !== undefined ? { lte: filters.eloMax } : {}),
              },
            },
          ]
        : []),
      ...(languages.length > 0 ? [{ languages: { hasSome: languages } }] : []),
      ...(query
        ? [
            {
              OR: [
                { battleTag: { contains: query, mode: "insensitive" as const } },
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
      battleTag: true,
      sr: true,
      primaryRole: true,
      secondaryRole: true,
      languages: true,
      recruitmentStatus: true,
      user: {
        select: {
          name: true,
          rosterSlots: {
            where: { team: { isNot: null } },
            select: {
              id: true,
              team: {
                select: { id: true, name: true, language: true, platform: true },
              },
            },
          },
        },
      },
    },
    orderBy: { sr: "desc" },
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
          language: true,
        },
      },
      user: { select: { playerProfile: { select: { id: true } } } },
    },
  });
}

export type PublicPlayerCard = Awaited<
  ReturnType<typeof getPublicPlayers>
>[number];
