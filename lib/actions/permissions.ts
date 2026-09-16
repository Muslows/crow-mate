"use server";

import { db } from "@/lib/db";
import { canEditTeamPermissions } from "@/lib/access";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { requireAuthSession } from "@/lib/session";
import { TEAM_GRANT_ROLES } from "@/lib/team-permissions";
import { saveTeamPermissionsSchema } from "@/lib/validations/permissions";
import type { TeamGrantRole } from "@/lib/team-permissions";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Seul le manager principal peut modifier les droits du staff.",
    fieldErrors: {},
  };
}

function parseGrantRole(value: string): TeamGrantRole | null {
  return TEAM_GRANT_ROLES.includes(value as TeamGrantRole)
    ? (value as TeamGrantRole)
    : null;
}

export async function saveTeamPermissions(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const teamId = formString(formData, "teamId");
  const userIds = formData.getAll("staffUserId").filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  const grants = userIds.map((userId) => ({
    userId,
    role: formString(formData, `role:${userId}`),
    canEditOfficialSchedule: formData.get(`canEditOfficialSchedule:${userId}`) === "on",
    canRecordScrim: formData.get(`canRecordScrim:${userId}`) === "on",
    canProposeScrim: formData.get(`canProposeScrim:${userId}`) === "on",
  }));

  const parsed = saveTeamPermissionsSchema.safeParse({
    teamId,
    grants: grants.map((grant) => ({
      ...grant,
      role: parseGrantRole(grant.role) ?? "COACH",
    })),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie la matrice de droits.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const allowed = await canEditTeamPermissions(parsed.data.teamId, session.user.id);
  if (!allowed) return forbidden();

  const team = await db.team.findUnique({
    where: { id: parsed.data.teamId },
    select: { managerId: true },
  });
  if (!team) {
    return { ok: false, message: "Équipe introuvable.", fieldErrors: {} };
  }

  const sanitized = parsed.data.grants.filter(
    (grant) => grant.userId !== team.managerId,
  );

  await db.$transaction(
    sanitized.map((grant) =>
      db.teamPermission.upsert({
        where: {
          teamId_userId: { teamId: parsed.data.teamId, userId: grant.userId },
        },
        create: {
          teamId: parsed.data.teamId,
          userId: grant.userId,
          role: grant.role,
          canEditOfficialSchedule: grant.canEditOfficialSchedule,
          canRecordScrim: grant.canRecordScrim,
          canProposeScrim: grant.canProposeScrim,
        },
        update: {
          role: grant.role,
          canEditOfficialSchedule: grant.canEditOfficialSchedule,
          canRecordScrim: grant.canRecordScrim,
          canProposeScrim: grant.canProposeScrim,
        },
      }),
    ),
  );

  revalidateTeamViews(parsed.data.teamId);
  return { ok: true, message: "Droits du staff enregistrés.", fieldErrors: {} };
}
