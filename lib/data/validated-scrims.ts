import { isAdmin } from "@/lib/admin";
import { canViewTeamMatchCenter } from "@/lib/access";
import { db } from "@/lib/db";
import { acceptedScrimWhen, emptyScrimConfig } from "@/lib/scrim-config";

const teamIdentitySelect = {
  id: true,
  name: true,
  estimatedSr: true,
  org: { select: { id: true, name: true, tag: true } },
  parentTeam: { select: { id: true, name: true } },
} as const;

const configSelect = {
  discordManager: true,
  battleTagContact: true,
  stagger: true,
  povStream: true,
  mapPool: true,
  lobbyHost: true,
} as const;

async function matchCenterTeamIds(userId: string): Promise<string[] | null> {
  if (isAdmin(userId)) return null;
  const teams = await db.team.findMany({
    where: {
      OR: [
        { managerId: userId },
        { seats: { some: { userId } } },
        { coaches: { some: { userId } } },
        { permissions: { some: { userId } } },
        { org: { ownerId: userId } },
        { org: { staff: { some: { userId } } } },
      ],
    },
    select: { id: true },
  });
  return teams.map((team) => team.id);
}

export async function getTeamScrimConfig(teamId: string) {
  const row = await db.teamScrimConfig.findUnique({
    where: { teamId },
    select: configSelect,
  });
  return row ?? emptyScrimConfig;
}

export async function getAcceptedScrimsForTeam(teamId: string) {
  const rows = await db.scrimProposal.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
    },
    include: {
      fromTeam: { select: teamIdentitySelect },
      toTeam: { select: teamIdentitySelect },
    },
  });
  return rows.sort(
    (a, b) =>
      acceptedScrimWhen(a.weekStartDate, a.weekday, a.slot).getTime() -
      acceptedScrimWhen(b.weekStartDate, b.weekday, b.slot).getTime(),
  );
}

export async function getAcceptedScrimsForStaff(userId: string) {
  const teamIds = await matchCenterTeamIds(userId);
  const rows = await db.scrimProposal.findMany({
    where: {
      status: "ACCEPTED",
      ...(teamIds
        ? {
            OR: [
              { fromTeamId: { in: teamIds } },
              { toTeamId: { in: teamIds } },
            ],
          }
        : {}),
    },
    include: {
      fromTeam: { select: teamIdentitySelect },
      toTeam: { select: teamIdentitySelect },
    },
  });
  return {
    teamIds,
    matches: rows.sort(
      (a, b) =>
        acceptedScrimWhen(a.weekStartDate, a.weekday, a.slot).getTime() -
        acceptedScrimWhen(b.weekStartDate, b.weekday, b.slot).getTime(),
    ),
  };
}

export async function getAcceptedScrimExchange(
  proposalId: string,
  viewerTeamId: string,
  userId: string,
) {
  const allowed = await canViewTeamMatchCenter(viewerTeamId, userId);
  if (!allowed) return null;

  const proposal = await db.scrimProposal.findUnique({
    where: { id: proposalId },
    include: {
      fromTeam: {
        select: {
          ...teamIdentitySelect,
          scrimConfig: { select: configSelect },
        },
      },
      toTeam: {
        select: {
          ...teamIdentitySelect,
          scrimConfig: { select: configSelect },
        },
      },
    },
  });
  if (!proposal || proposal.status !== "ACCEPTED") return null;
  if (
    proposal.fromTeamId !== viewerTeamId &&
    proposal.toTeamId !== viewerTeamId
  ) {
    return null;
  }

  const ours =
    proposal.fromTeamId === viewerTeamId ? proposal.fromTeam : proposal.toTeam;
  const opponent =
    proposal.fromTeamId === viewerTeamId ? proposal.toTeam : proposal.fromTeam;

  return {
    proposal,
    ours: {
      ...ours,
      scrimConfig: ours.scrimConfig ?? emptyScrimConfig,
    },
    opponent: {
      ...opponent,
      scrimConfig: opponent.scrimConfig ?? emptyScrimConfig,
    },
  };
}
