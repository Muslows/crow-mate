import type { PlayerRole, SpokenLanguage } from "@prisma/client";
import { db } from "@/lib/db";
import { OPEN_POSITION_SR_TOLERANCE } from "@/lib/lfp";
import { srBand } from "@/lib/scrim-slots";
import { scrimEloField } from "@/lib/scrim-elo";

export async function listOpenPositionsForTeam(teamId: string) {
  return db.openPosition.findMany({
    where: { teamId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOpenPositionById(positionId: string) {
  return db.openPosition.findUnique({
    where: { id: positionId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          language: true,
          platform: true,
          estimatedSr: true,
          managerId: true,
          orgId: true,
          org: { select: { tag: true } },
        },
      },
    },
  });
}

export async function findPlayersForOpenPosition(input: {
  teamId: string;
  language: SpokenLanguage;
  estimatedSr: number;
  role: PlayerRole;
  managerId: string;
}) {
  const band = srBand(input.estimatedSr, OPEN_POSITION_SR_TOLERANCE);
  const eloField = scrimEloField(input.role);
  return db.playerProfile.findMany({
    where: {
      openToPlay: { has: input.role },
      languages: { has: input.language },
      OR: [
        {
          [eloField]: {
            gte: Math.max(1, band.min),
            lte: band.max,
          },
        },
        {
          AND: [
            { [eloField]: 0 },
            { sr: { gte: band.min, lte: band.max } },
          ],
        },
      ],
      user: {
        deactivatedAt: null,
        id: { not: input.managerId },
        rosterSlots: { none: { teamId: input.teamId } },
        teamMemberships: { none: { teamId: input.teamId } },
      },
    },
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
                select: {
                  id: true,
                  name: true,
                  language: true,
                  platform: true,
                  org: { select: { tag: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { sr: "desc" },
    take: 40,
  });
}

export type OpenPositionMatch = Awaited<
  ReturnType<typeof findPlayersForOpenPosition>
>[number];
