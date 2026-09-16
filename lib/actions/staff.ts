"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  assignManagerSchema,
  staffIdSchema,
  staffMemberSchema,
} from "@/lib/validations/staff";
import {
  isAdminRole,
  requireAuthSession,
  sessionCapabilities,
} from "@/lib/session";
import { getOwnedStructure } from "@/lib/data/structures";
import { labelFor, STAFF_ROLES } from "@/lib/constants";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Seul le propriétaire de la structure peut gérer le staff.",
    fieldErrors: {},
  };
}

async function requireOwnedStructure(structureId: string) {
  const session = await requireAuthSession();
  const admin = isAdminRole(sessionCapabilities(session));
  const structure = await getOwnedStructure(structureId, session.user.id, admin);
  return { session, structure };
}

function revalidateOrg(structureId: string) {
  revalidatePath("/org");
  revalidatePath(`/org/${structureId}`);
}

export async function addStructureStaff(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = staffMemberSchema.safeParse({
    structureId: formString(formData, "structureId"),
    userId: formString(formData, "userId").trim(),
    role: formString(formData, "role"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le membre du staff.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { structure } = await requireOwnedStructure(parsed.data.structureId);
  if (!structure) return forbidden();

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, name: true },
  });
  if (!user) {
    return {
      ok: false,
      message: "Aucun compte pour cet ID.",
      fieldErrors: { userId: ["Utilisateur introuvable."] },
    };
  }

  if (user.id === structure.owner.id) {
    return {
      ok: false,
      message: "Le propriétaire n'a pas besoin d'un rôle staff.",
      fieldErrors: { userId: ["Déjà owner."] },
    };
  }

  await db.structureStaff.upsert({
    where: {
      structureId_userId: {
        structureId: structure.id,
        userId: user.id,
      },
    },
    create: {
      structureId: structure.id,
      userId: user.id,
      role: parsed.data.role,
    },
    update: { role: parsed.data.role },
  });

  await db.user.update({
    where: { id: user.id },
    data: { isStaff: true },
  });

  revalidateOrg(structure.id);
  return {
    ok: true,
    message: `${user.name} ajouté comme ${labelFor(STAFF_ROLES, parsed.data.role)}.`,
    fieldErrors: {},
  };
}

export async function removeStructureStaff(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = staffIdSchema.safeParse({
    staffId: formString(formData, "staffId"),
  });
  if (!parsed.success) return forbidden();

  const row = await db.structureStaff.findUnique({
    where: { id: parsed.data.staffId },
    select: {
      id: true,
      structureId: true,
      userId: true,
      structure: { select: { ownerId: true } },
    },
  });
  if (!row) {
    return { ok: false, message: "Membre introuvable.", fieldErrors: {} };
  }

  const { structure } = await requireOwnedStructure(row.structureId);
  if (!structure) return forbidden();

  await db.structureStaff.delete({ where: { id: row.id } });

  const remaining = await db.structureStaff.count({
    where: { userId: row.userId },
  });
  if (remaining === 0) {
    await db.user.update({
      where: { id: row.userId },
      data: { isStaff: false },
    });
  }

  revalidateOrg(row.structureId);
  return { ok: true, message: "Membre retiré du staff.", fieldErrors: {} };
}

export async function assignTeamManager(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = assignManagerSchema.safeParse({
    structureId: formString(formData, "structureId"),
    teamId: formString(formData, "teamId"),
    userId: formString(formData, "userId").trim(),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie l'assignation du manager.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { structure } = await requireOwnedStructure(parsed.data.structureId);
  if (!structure) return forbidden();

  const team = structure.teams.find((item) => item.id === parsed.data.teamId);
  if (!team) {
    return {
      ok: false,
      message: "Cette équipe n'appartient pas à la structure.",
      fieldErrors: {},
    };
  }

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, name: true },
  });
  if (!user) {
    return {
      ok: false,
      message: "Aucun compte pour cet ID.",
      fieldErrors: { userId: ["Utilisateur introuvable."] },
    };
  }

  await db.$transaction([
    db.team.update({
      where: { id: team.id },
      data: { managerId: user.id },
    }),
    db.teamSeat.upsert({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
      create: { teamId: team.id, userId: user.id, kind: "PRIMARY" },
      update: { kind: "PRIMARY" },
    }),
    db.teamSeat.upsert({
      where: { teamId_userId: { teamId: team.id, userId: team.managerId } },
      create: {
        teamId: team.id,
        userId: team.managerId,
        kind: "CO_MANAGER",
      },
      update: { kind: "CO_MANAGER" },
    }),
    db.user.update({
      where: { id: user.id },
      data: { isManager: true },
    }),
  ]);

  revalidateTeamViews(team.id);
  revalidateOrg(structure.id);
  return {
    ok: true,
    message: `${user.name} est désormais manager de l'équipe.`,
    fieldErrors: {},
  };
}
