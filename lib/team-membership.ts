import type { PlayerRole, Prisma, PrismaClient, TeamOrgRole } from "@prisma/client";
import { fallbackBattleTag } from "@/lib/battletag";
import { rankFromSr } from "@/lib/rank";
import { DEFAULT_GRANTS } from "@/lib/team-permissions";
import { defaultRosterRole } from "@/lib/specialties";

type Db = PrismaClient | Prisma.TransactionClient;

export const TEAM_ORG_ROLES = [
  { value: "PLAYER" as const, label: "Joueur" },
  { value: "CAPTAIN" as const, label: "Capitaine" },
  { value: "COACH" as const, label: "Coach" },
  { value: "MANAGER" as const, label: "Manager" },
];

export function uniqueOrgRoles(roles: TeamOrgRole[]): TeamOrgRole[] {
  const next = Array.from(new Set(roles));
  return next.length > 0 ? next : ["PLAYER"];
}

export function orgRoleLabels(roles: readonly TeamOrgRole[]): string[] {
  return uniqueOrgRoles([...roles]).map(
    (role) => TEAM_ORG_ROLES.find((item) => item.value === role)?.label ?? role,
  );
}

export function rosterDualLabel(input: {
  orgRoles: readonly TeamOrgRole[];
  playerRole: PlayerRole | null;
  playerRoleLabel?: string | null;
}): string {
  const org = orgRoleLabels(input.orgRoles).join(" · ");
  const ingame = input.playerRoleLabel?.trim();
  if (org && ingame) return `${org} / ${ingame}`;
  return org || ingame || "Membre";
}

export async function upsertTeamMembership(
  db: Db,
  input: {
    teamId: string;
    userId: string;
    playerRole?: PlayerRole | null;
    orgRoles?: TeamOrgRole[];
  },
) {
  const orgRoles = uniqueOrgRoles(input.orgRoles ?? ["PLAYER"]);
  const membership = await db.teamMembership.upsert({
    where: {
      teamId_userId: { teamId: input.teamId, userId: input.userId },
    },
    create: {
      teamId: input.teamId,
      userId: input.userId,
      playerRole: input.playerRole ?? null,
      orgRoles,
    },
    update: {
      playerRole: input.playerRole === undefined ? undefined : input.playerRole,
      orgRoles,
    },
  });
  await syncMembershipSideEffects(db, membership.teamId, membership.userId);
  return membership;
}

export async function syncMembershipSideEffects(
  db: Db,
  teamId: string,
  userId: string,
) {
  const membership = await db.teamMembership.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!membership) return;

  const roles = new Set(membership.orgRoles);
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { managerId: true },
  });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      playerProfile: true,
    },
  });
  if (!user) return;

  if (roles.has("COACH")) {
    await db.teamCoach.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId },
      update: {},
    });
    await db.user.update({
      where: { id: userId },
      data: { isCoach: true },
    });
    await db.teamPermission.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: {
        teamId,
        userId,
        role: "COACH",
        ...DEFAULT_GRANTS.COACH,
      },
      update: { role: "COACH", ...DEFAULT_GRANTS.COACH },
    });
  } else {
    await db.teamCoach.deleteMany({ where: { teamId, userId } });
  }

  if (roles.has("MANAGER") && team?.managerId !== userId) {
    await db.teamSeat.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId, kind: "CO_MANAGER" },
      update: {},
    });
    await db.user.update({
      where: { id: userId },
      data: { isManager: true },
    });
  } else if (!roles.has("MANAGER") && team?.managerId !== userId) {
    await db.teamSeat.deleteMany({
      where: { teamId, userId, kind: "CO_MANAGER" },
    });
  }

  if (roles.has("CAPTAIN") && !roles.has("COACH")) {
    await db.teamPermission.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: {
        teamId,
        userId,
        role: "CAPTAIN",
        ...DEFAULT_GRANTS.CAPTAIN,
      },
      update: {
        role: "CAPTAIN",
        ...DEFAULT_GRANTS.CAPTAIN,
      },
    });
  }

  const wantsRoster = roles.has("PLAYER") || Boolean(membership.playerRole);
  if (wantsRoster) {
    const profile = user.playerProfile;
    const battleTag =
      profile?.battleTag.trim() || fallbackBattleTag(user.name, userId);
    const role =
      membership.playerRole ??
      defaultRosterRole(profile?.openToPlay, profile?.role ?? "TANK");
    const sr = profile?.sr ?? 0;
    await db.player.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: {
        teamId,
        userId,
        battleTag,
        role,
        sr,
        rankDivision: rankFromSr(sr),
        status: "TRIAL",
        favoriteHeroes: profile?.favoriteHeroes ?? [],
        experience: profile?.experience ?? "",
      },
      update: {
        battleTag,
        role,
        sr,
        rankDivision: rankFromSr(sr),
        favoriteHeroes: profile?.favoriteHeroes ?? [],
        experience: profile?.experience ?? "",
      },
    });
    await db.user.update({
      where: { id: userId },
      data: { isPlayer: true },
    });
  } else {
    await db.player.deleteMany({ where: { teamId, userId } });
  }
}

export async function removeTeamMembership(
  db: Db,
  teamId: string,
  userId: string,
) {
  await db.teamMembership.deleteMany({ where: { teamId, userId } });
  await db.player.deleteMany({ where: { teamId, userId } });
  await db.teamCoach.deleteMany({ where: { teamId, userId } });
  await db.teamPermission.deleteMany({ where: { teamId, userId } });
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { managerId: true },
  });
  if (team?.managerId !== userId) {
    await db.teamSeat.deleteMany({
      where: { teamId, userId, kind: "CO_MANAGER" },
    });
  }
}
