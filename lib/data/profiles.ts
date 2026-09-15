import { db } from "@/lib/db";

const profileUserSelect = {
  id: true,
  name: true,
  rosterSlots: {
    where: { team: { isNot: null } },
    select: {
      id: true,
      teamId: true,
      team: { select: { id: true, name: true, language: true } },
    },
  },
} as const;

export async function getPlayerProfileById(id: string) {
  return db.playerProfile.findUnique({
    where: { id },
    include: { user: { select: profileUserSelect } },
  });
}

export async function getPlayerProfileByUserId(userId: string) {
  return db.playerProfile.findUnique({
    where: { userId },
    include: { user: { select: profileUserSelect } },
  });
}

export async function resolvePlayerAccount(playerId: string) {
  const byProfile = await db.playerProfile.findUnique({
    where: { id: playerId },
    include: {
      user: { select: { id: true, name: true, isPlayer: true } },
    },
  });
  if (byProfile) return byProfile;

  return db.playerProfile.findUnique({
    where: { userId: playerId },
    include: {
      user: { select: { id: true, name: true, isPlayer: true } },
    },
  });
}
