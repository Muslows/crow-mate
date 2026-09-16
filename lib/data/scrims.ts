import { db } from "@/lib/db";
import type { OpponentBehavior } from "@prisma/client";

export async function getTeamScrims(
  teamId: string,
  behavior?: OpponentBehavior,
) {
  return db.scrim.findMany({
    where: {
      teamId,
      ...(behavior ? { opponentBehavior: behavior } : {}),
    },
    include: {
      maps: { orderBy: { sortOrder: "asc" } },
      createdBy: { select: { id: true, name: true } },
      opponentTeam: {
        select: { id: true, name: true, org: { select: { tag: true } } },
      },
    },
    orderBy: { playedAt: "desc" },
  });
}

export type TeamScrim = Awaited<ReturnType<typeof getTeamScrims>>[number];
