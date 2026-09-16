import { db } from "@/lib/db";

/**
 * Removes roster rows that are not attached to a real User account.
 * Detaches them from teams first (teamId = null) then deletes the orphan slots.
 */
export async function cleanupOrphanRosterPlayers(): Promise<{ deleted: number }> {
  const orphans = await db.player.findMany({
    where: { userId: null },
    select: { id: true },
  });

  if (orphans.length === 0) {
    return { deleted: 0 };
  }

  const ids = orphans.map((row) => row.id);

  await db.$transaction(async (tx) => {
    await tx.player.updateMany({
      where: { id: { in: ids } },
      data: { teamId: null },
    });
    await tx.player.deleteMany({
      where: { id: { in: ids }, userId: null },
    });
  });

  return { deleted: ids.length };
}
