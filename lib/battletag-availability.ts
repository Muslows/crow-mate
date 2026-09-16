import { db } from "@/lib/db";

export async function isBattleTagTaken(
  battleTag: string,
  excludeUserId?: string,
): Promise<boolean> {
  const tag = battleTag.trim();
  if (!tag) return false;

  const existing = await db.playerProfile.findFirst({
    where: {
      battleTag: tag,
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  return Boolean(existing);
}
