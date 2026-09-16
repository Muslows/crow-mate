import { db } from "@/lib/db";
import { isoToUtcDate } from "@/lib/week";

export async function getIncomingScrimProposals(userId: string) {
  return db.scrimProposal.findMany({
    where: {
      status: "PENDING",
      toTeam: {
        OR: [{ managerId: userId }, { seats: { some: { userId } } }],
      },
    },
    include: {
      fromTeam: {
        select: { id: true, name: true, org: { select: { tag: true } } },
      },
      toTeam: {
        select: { id: true, name: true, org: { select: { tag: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOutgoingScrimProposals(teamId: string) {
  return db.scrimProposal.findMany({
    where: { fromTeamId: teamId, status: "PENDING" },
    include: {
      toTeam: {
        select: { id: true, name: true, org: { select: { tag: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countPendingScrimProposals(userId: string) {
  return db.scrimProposal.count({
    where: {
      status: "PENDING",
      toTeam: {
        OR: [{ managerId: userId }, { seats: { some: { userId } } }],
      },
    },
  });
}

export async function getOfficialDaysForTeam(
  teamId: string,
  weekStartIso: string,
) {
  return db.officialSchedule.findUnique({
    where: {
      teamId_weekStartDate: {
        teamId,
        weekStartDate: isoToUtcDate(weekStartIso),
      },
    },
  });
}
