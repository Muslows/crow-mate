import { getPendingInvitationsForUser } from "@/lib/data/invitations";
import { getIncomingScrimProposals } from "@/lib/data/proposals";
import {
  getPendingClubInvitesForManager,
  getPendingStructureInvitesForManager,
  getPendingStructureRequestsForOwner,
} from "@/lib/data/structures";

export async function getNotificationInbox(userId: string) {
  const [
    teamInvites,
    structureInvites,
    structureRequests,
    clubInvites,
    scrimProposals,
  ] = await Promise.all([
    getPendingInvitationsForUser(userId),
    getPendingStructureInvitesForManager(userId),
    getPendingStructureRequestsForOwner(userId),
    getPendingClubInvitesForManager(userId),
    getIncomingScrimProposals(userId),
  ]);

  return {
    teamInvites: teamInvites.map((invite) => ({
      id: invite.id,
      message: invite.message,
      kind: invite.kind,
      team: { id: invite.team.id, name: invite.team.name },
      inviter: { name: invite.inviter.name },
    })),
    structureInvites: structureInvites.map((invite) => ({
      id: invite.id,
      structure: invite.structure,
      team: { id: invite.team.id, name: invite.team.name },
    })),
    structureRequests: structureRequests.map((invite) => ({
      id: invite.id,
      structure: invite.structure,
      team: { id: invite.team.id, name: invite.team.name },
    })),
    clubInvites: clubInvites.map((invite) => ({
      id: invite.id,
      parentTeam: { name: invite.parentTeam.name },
      childTeam: { name: invite.childTeam.name },
    })),
    scrimProposals: scrimProposals.map((proposal) => ({
      id: proposal.id,
      weekday: proposal.weekday,
      slot: proposal.slot,
      fromTeam: {
        id: proposal.fromTeam.id,
        name: proposal.fromTeam.name,
        estimatedSr: proposal.fromTeam.estimatedSr,
        org: proposal.fromTeam.org,
        parentTeam: proposal.fromTeam.parentTeam,
      },
    })),
    count:
      teamInvites.length +
      structureInvites.length +
      structureRequests.length +
      clubInvites.length +
      scrimProposals.length,
  };
}

export type NotificationInbox = Awaited<ReturnType<typeof getNotificationInbox>>;

export const emptyNotificationInbox: NotificationInbox = {
  teamInvites: [],
  structureInvites: [],
  structureRequests: [],
  clubInvites: [],
  scrimProposals: [],
  count: 0,
};
