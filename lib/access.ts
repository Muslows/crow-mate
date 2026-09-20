import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { DEFAULT_GRANTS } from "@/lib/team-permissions";
import type { StaffRole } from "@prisma/client";

export async function getStaffRoleForStructure(
  userId: string,
  structureId: string,
): Promise<StaffRole | null> {
  const row = await db.structureStaff.findUnique({
    where: {
      structureId_userId: { structureId, userId },
    },
    select: { role: true },
  });
  return row?.role ?? null;
}

export async function getStaffMemberships(userId: string) {
  return db.structureStaff.findMany({
    where: { userId },
    select: {
      role: true,
      structure: {
        select: { id: true, name: true, tag: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function loadTeamAccessContext(teamId: string, userId: string) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      managerId: true,
      leadership: true,
      orgId: true,
      parentTeamId: true,
      org: { select: { ownerId: true } },
    },
  });
  if (!team) return null;

  const [seat, teamCoach, permission] = await Promise.all([
    db.teamSeat.findUnique({
      where: { teamId_userId: { teamId, userId } },
      select: { kind: true },
    }),
    db.teamCoach.findUnique({
      where: { teamId_userId: { teamId, userId } },
      select: { id: true },
    }),
    db.teamPermission.findUnique({
      where: { teamId_userId: { teamId, userId } },
      select: {
        canEditOfficialSchedule: true,
        canRecordScrim: true,
        canProposeScrim: true,
      },
    }),
  ]);

  const admin = isAdmin(userId);
  const manager = team.managerId === userId || Boolean(seat);
  const primaryManager = team.managerId === userId;
  const structureOwner = team.org?.ownerId === userId;
  const staffRole = team.orgId
    ? await getStaffRoleForStructure(userId, team.orgId)
    : null;

  return {
    team,
    admin,
    manager,
    primaryManager,
    seatKind: seat?.kind ?? null,
    teamCoach: Boolean(teamCoach),
    permission,
    structureOwner,
    staffRole,
  };
}

export async function canViewTeamInternal(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  if (ctx.admin || ctx.manager || ctx.structureOwner || ctx.staffRole) {
    return true;
  }
  const onRoster = await db.player.findFirst({
    where: { teamId, userId },
    select: { id: true },
  });
  return Boolean(onRoster);
}

export async function canEditTeamPermissions(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  return ctx.admin || ctx.primaryManager;
}

function granted(
  ctx: NonNullable<Awaited<ReturnType<typeof loadTeamAccessContext>>>,
  flag: "canEditOfficialSchedule" | "canRecordScrim" | "canProposeScrim",
) {
  if (ctx.admin || ctx.primaryManager) return true;
  if (ctx.permission) return ctx.permission[flag];
  if (ctx.teamCoach || ctx.staffRole === "COACH") {
    return DEFAULT_GRANTS.COACH[flag];
  }
  if (ctx.staffRole === "ASSISTANT_COACH") {
    return DEFAULT_GRANTS.ASSISTANT_COACH[flag];
  }
  if (ctx.seatKind) return DEFAULT_GRANTS.CAPTAIN[flag];
  return false;
}

export async function canWriteTeamPlanning(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  return granted(ctx, "canEditOfficialSchedule");
}

export async function canRecordTeamScrim(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  return granted(ctx, "canRecordScrim");
}

export async function canProposeTeamScrim(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  return granted(ctx, "canProposeScrim");
}

export async function canRespondToScrimProposal(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  if (
    ctx.admin ||
    ctx.manager ||
    ctx.teamCoach ||
    ctx.staffRole === "COACH"
  ) {
    return true;
  }
  return Boolean(ctx.permission?.canProposeScrim);
}

export async function canViewTeamMatchCenter(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  if (
    ctx.admin ||
    ctx.primaryManager ||
    ctx.manager ||
    ctx.teamCoach ||
    ctx.structureOwner
  ) {
    return true;
  }
  if (ctx.staffRole === "COACH" || ctx.staffRole === "ASSISTANT_COACH") {
    return true;
  }
  return granted(ctx, "canProposeScrim") || granted(ctx, "canRecordScrim");
}

export async function canEditTeamScrimConfig(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  if (
    ctx.admin ||
    ctx.manager ||
    ctx.teamCoach ||
    ctx.structureOwner ||
    ctx.staffRole === "COACH"
  ) {
    return true;
  }
  return Boolean(
    ctx.permission?.canProposeScrim || ctx.permission?.canRecordScrim,
  );
}

export async function canManageOpenPositions(
  teamId: string,
  userId: string,
): Promise<boolean> {
  const ctx = await loadTeamAccessContext(teamId, userId);
  if (!ctx) return false;
  if (
    ctx.admin ||
    ctx.manager ||
    ctx.teamCoach ||
    ctx.structureOwner ||
    ctx.staffRole === "COACH" ||
    ctx.staffRole === "ASSISTANT_COACH"
  ) {
    return true;
  }
  return granted(ctx, "canProposeScrim");
}

export async function canInvitePlayersToTeam(
  teamId: string,
  userId: string,
): Promise<boolean> {
  return canWriteTeamPlanning(teamId, userId);
}

export async function canRecruitViaChat(userId: string): Promise<boolean> {
  if (isAdmin(userId)) return true;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      isManager: true,
      isStaff: true,
      role: true,
      _count: {
        select: {
          teams: true,
          teamSeats: true,
          teamCoaches: true,
          ownedStructures: true,
          staffMemberships: true,
        },
      },
    },
  });
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.isManager && (user._count.teams > 0 || user._count.teamSeats > 0)) {
    return true;
  }
  if (user.isManager) return true;
  if (user.isStaff && (user._count.ownedStructures > 0 || user._count.staffMemberships > 0)) {
    return true;
  }
  if (user._count.teamCoaches > 0) return true;
  const principalCoach = await db.structureStaff.findFirst({
    where: { userId, role: "COACH" },
    select: { id: true },
  });
  return Boolean(principalCoach);
}
