import { db } from "@/lib/db";
import {
  buildFairPlayIndex,
  emptyFairPlayIndex,
  type FairPlayIndex,
  type OpponentBehavior,
} from "@/lib/fair-play";

export async function getTeamFairPlayIndex(
  teamId: string,
): Promise<FairPlayIndex> {
  const grouped = await db.scrim.groupBy({
    by: ["opponentBehavior"],
    where: { opponentTeamId: teamId },
    _count: { opponentBehavior: true },
  });

  const counts: Record<OpponentBehavior, number> = {
    COURTOIS: 0,
    BON: 0,
    PEU_AGREABLE: 0,
    TOXIQUE_OU_TROLL: 0,
  };
  for (const row of grouped) {
    counts[row.opponentBehavior] = row._count.opponentBehavior;
  }
  return grouped.length === 0 ? emptyFairPlayIndex() : buildFairPlayIndex(counts);
}

export async function getFairPlayIndexes(teamIds: string[]) {
  const indexes = new Map<string, FairPlayIndex>();
  if (teamIds.length === 0) return indexes;
  const grouped = await db.scrim.groupBy({
    by: ["opponentTeamId", "opponentBehavior"],
    where: { opponentTeamId: { in: teamIds } },
    _count: { opponentBehavior: true },
  });
  const buckets = new Map<string, Record<OpponentBehavior, number>>();
  for (const id of teamIds) {
    buckets.set(id, {
      COURTOIS: 0,
      BON: 0,
      PEU_AGREABLE: 0,
      TOXIQUE_OU_TROLL: 0,
    });
  }
  for (const row of grouped) {
    if (!row.opponentTeamId) continue;
    const bucket = buckets.get(row.opponentTeamId);
    if (!bucket) continue;
    bucket[row.opponentBehavior] = row._count.opponentBehavior;
  }
  for (const [id, counts] of buckets) {
    indexes.set(id, buildFairPlayIndex(counts));
  }
  return indexes;
}
