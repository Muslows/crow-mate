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
          playerProfile: { select: { id: true, displayName: true, sr: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countPendingInvitations(userId: string) {
  const [playerInvites, structureInvites, structureRequests, clubInvites, proposals] = await Promise.all([
    db.teamInvitation.count({
      where: { inviteeId: userId, status: "PENDING" },
    }),
    db.structureInvitation.count({
      where: { status: "PENDING", team: { managerId: userId } },
    }),
    db.structureInvitation.count({
      where: {
        status: "PENDING",
        requestedByTeam: true,
        structure: { ownerId: userId },
      },
    }),
    db.clubInvitation.count({
      where: { status: "PENDING", parentTeam: { managerId: userId } },
    }),
    db.scrimProposal.count({
      where: {
        status: "PENDING",
        toTeam: {
          OR: [{ managerId: userId }, { seats: { some: { userId } } }],
        },
      },
    }),
  ]);
  return playerInvites + structureInvites + structureRequests + clubInvites + proposals;
}
