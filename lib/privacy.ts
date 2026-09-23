import { db } from "@/lib/db";
import { isBattleTagVisible } from "@/lib/privacy-display";

export {
  isBattleTagVisible,
  ownerDisplayName,
  publicDisplayName,
} from "@/lib/privacy-display";

export async function canRevealBattleTag(
  viewerId: string | null | undefined,
  ownerUserId: string,
  battleTagPublic?: boolean,
): Promise<boolean> {
  if (battleTagPublic === true) return true;
  if (viewerId && viewerId === ownerUserId) return true;
  if (battleTagPublic === false) return false;
  const profile = await db.playerProfile.findUnique({
    where: { userId: ownerUserId },
    select: { battleTagPublic: true },
  });
  return isBattleTagVisible({
    battleTagPublic: Boolean(profile?.battleTagPublic),
    viewerId,
    ownerUserId,
  });
}

export async function canRevealDiscord(
  viewerId: string | null | undefined,
  ownerUserId: string,
  discordPublic: boolean,
): Promise<boolean> {
  if (discordPublic) return true;
  if (!viewerId) return false;
  if (viewerId === ownerUserId) return true;

  const managedTeam = await db.team.findFirst({
    where: {
      managerId: viewerId,
      players: { some: { userId: ownerUserId } },
    },
    select: { id: true },
  });
  return Boolean(managedTeam);
}
