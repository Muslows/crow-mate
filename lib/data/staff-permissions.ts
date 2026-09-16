import { db } from "@/lib/db";
import {
  DEFAULT_GRANTS,
  type TeamGrantRole,
  type TeamPermissionMatrix,
} from "@/lib/team-permissions";

export type TeamStaffGrant = {
  userId: string;
  name: string;
  role: TeamGrantRole;
  grants: TeamPermissionMatrix;
};

function matrixFrom(
  role: TeamGrantRole,
  row?: {
    canEditOfficialSchedule: boolean;
    canRecordScrim: boolean;
    canProposeScrim: boolean;
  } | null,
): TeamPermissionMatrix {
  return {
    canEditOfficialSchedule:
      row?.canEditOfficialSchedule ?? DEFAULT_GRANTS[role].canEditOfficialSchedule,
    canRecordScrim: row?.canRecordScrim ?? DEFAULT_GRANTS[role].canRecordScrim,
    canProposeScrim: row?.canProposeScrim ?? DEFAULT_GRANTS[role].canProposeScrim,
  };
}

export async function listTeamStaffGrants(
  teamId: string,
): Promise<TeamStaffGrant[]> {
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: {
      managerId: true,
      orgId: true,
      coaches: {
        select: { userId: true, user: { select: { name: true } } },
      },
      seats: {
        select: { userId: true, user: { select: { name: true } } },
      },
      permissions: true,
      players: { select: { userId: true } },
    },
  });
  if (!team) return [];
  const managerId = team.managerId;

  const orgStaff = team.orgId
    ? await db.structureStaff.findMany({
        where: {
          structureId: team.orgId,
          role: { in: ["COACH", "ASSISTANT_COACH"] },
        },
        select: {
          userId: true,
          role: true,
          user: { select: { name: true } },
        },
      })
    : [];

  const rosterUserIds = new Set(
    team.players
      .map((player) => player.userId)
      .filter((id): id is string => Boolean(id)),
  );
  const byUser = new Map<string, TeamStaffGrant>();
  const existing = new Map(
    team.permissions.map((row) => [row.userId, row] as const),
  );

  function add(userId: string, name: string, role: TeamGrantRole) {
    if (userId === managerId) return;
    const current = byUser.get(userId);
    if (current && current.role === "COACH") return;
    if (current && role === "ASSISTANT_COACH") return;
    byUser.set(userId, {
      userId,
      name,
      role,
      grants: matrixFrom(role, existing.get(userId)),
    });
  }

  for (const coach of team.coaches) {
    add(coach.userId, coach.user.name, "COACH");
  }
  for (const staff of orgStaff) {
    add(
      staff.userId,
      staff.user.name,
      staff.role === "ASSISTANT_COACH" ? "ASSISTANT_COACH" : "COACH",
    );
  }
  for (const seat of team.seats) {
    if (rosterUserIds.has(seat.userId) || seat.userId !== managerId) {
      add(seat.userId, seat.user.name, "CAPTAIN");
    }
  }

  return [...byUser.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "fr"),
  );
}
