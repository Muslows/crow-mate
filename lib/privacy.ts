import { db } from "@/lib/db";

export function publicDisplayName(input: {
  displayName?: string | null;
  name?: string | null;
}): string {
  const display = input.displayName?.trim();
  if (display) return display;
  const name = input.name?.trim();
  if (name) return name;
  return "Joueur";
}

export function ownerDisplayName(input: {
  displayName?: string | null;
  battleTag?: string | null;
  name?: string | null;
}): string {
  const display = input.displayName?.trim();
  if (display) return display;
  const tag = input.battleTag?.trim();
  if (tag) return tag;
  return publicDisplayName(input);
}

export function isBattleTagVisible(input: {
  battleTagPublic: boolean;
  viewerId?: string | null;
  ownerUserId: string;
}): boolean {
  if (input.battleTagPublic) return true;
  return Boolean(input.viewerId && input.viewerId === input.ownerUserId);
}

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
