import { db } from "@/lib/db";

export async function getPendingInvitationsForUser(userId: string) {
  return db.teamInvitation.findMany({
    where: { inviteeId: userId, status: "PENDING" },
    include: {
      team: { select: { id: true, name: true, platform: true } },
      inviter: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeamInvitations(teamId: string) {
  return db.teamInvitation.findMany({
    where: { teamId },
    include: {
      invitee: {
        select: {
          id: true,
          name: true,
          playerProfile: { select: { id: true, battleTag: true, sr: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countPendingInvitations(userId: string) {
  return db.teamInvitation.count({
    where: { inviteeId: userId, status: "PENDING" },
  });
}
