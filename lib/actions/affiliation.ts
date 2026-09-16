"use server";

import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  clubInviteResponseSchema,
  clubInviteSchema,
} from "@/lib/validations/club";
import { structureJoinRequestSchema } from "@/lib/validations/structure";
import { requireAuthSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

function affiliationError(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

async function wouldCreateAcademyCycle(
  childId: string,
  parentId: string,
): Promise<boolean> {
  if (childId === parentId) return true;
  const seen = new Set<string>();
  let current: string | null = parentId;
  while (current) {
    if (current === childId) return true;
    if (seen.has(current)) return true;
    seen.add(current);
    const row: { parentTeamId: string | null } | null = await db.team.findUnique({
      where: { id: current },
      select: { parentTeamId: true },
    });
    current = row?.parentTeamId ?? null;
  }
  return false;
}

export async function requestClubAffiliation(
  childTeamId: string,
  parentTeamId: string,
  userId: string,
): Promise<ActionState> {
  const parsed = clubInviteSchema.safeParse({ childTeamId, parentTeamId });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Team ID du club parent invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const child = await db.team.findUnique({
    where: { id: parsed.data.childTeamId },
    select: { id: true, managerId: true, orgId: true, parentTeamId: true },
  });
  if (!child || child.managerId !== userId) {
    return affiliationError("Tu ne peux affilier que tes équipes.");
  }
  if (child.orgId) {
    return affiliationError(
      "Cette équipe est déjà dans une structure professionnelle.",
    );
  }
  if (child.parentTeamId) {
    return affiliationError("Cette équipe est déjà dans un club.");
  }

  const parent = await db.team.findUnique({
    where: { id: parsed.data.parentTeamId },
    select: { id: true, name: true, orgId: true, managerId: true },
  });
  if (!parent) {
    return {
      ok: false,
      message: "Club / équipe parente introuvable.",
      fieldErrors: { affiliationId: ["Team ID introuvable."] },
    };
  }
  if (parent.orgId) {
    return {
      ok: false,
      message: "Cette équipe est déjà dans une structure. Utilise l'affiliation Structure.",
      fieldErrors: { affiliationId: ["Cible professionnelle."] },
    };
  }
  if (await wouldCreateAcademyCycle(child.id, parent.id)) {
    return affiliationError("Cette affiliation créerait une boucle d'académies.");
  }

  const existing = await db.clubInvitation.findUnique({
    where: {
      parentTeamId_childTeamId: {
        parentTeamId: parent.id,
        childTeamId: child.id,
      },
    },
  });
  if (existing?.status === "PENDING") {
    return affiliationError("Une demande est déjà en attente auprès de ce club.");
  }
  if (existing?.status === "ACCEPTED" && child.parentTeamId === parent.id) {
    return affiliationError("Déjà affiliée à ce club.");
  }

  if (existing) {
    await db.clubInvitation.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        inviterId: userId,
        respondedAt: null,
      },
    });
  } else {
    await db.clubInvitation.create({
      data: {
        parentTeamId: parent.id,
        childTeamId: child.id,
        inviterId: userId,
      },
    });
  }

  revalidatePath("/manage");
  return {
    ok: true,
    message: `Demande envoyée au manager de ${parent.name}.`,
    fieldErrors: {},
  };
}

export async function requestStructureAffiliation(
  teamId: string,
  structureId: string,
  userId: string,
): Promise<ActionState> {
  const parsed = structureJoinRequestSchema.safeParse({ teamId, structureId });
  if (!parsed.success) {
    return {
      ok: false,
      message: "ID de structure invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const team = await db.team.findUnique({
    where: { id: parsed.data.teamId },
    select: { id: true, managerId: true, orgId: true, parentTeamId: true, name: true },
  });
  if (!team || team.managerId !== userId) {
    return affiliationError("Tu ne peux affilier que tes équipes.");
  }
  if (team.orgId) {
    return affiliationError("Cette équipe est déjà dans une structure.");
  }

  const structure = await db.structure.findUnique({
    where: { id: parsed.data.structureId },
    select: { id: true, name: true, tag: true },
  });
  if (!structure) {
    return {
      ok: false,
      message: "Structure introuvable.",
      fieldErrors: { affiliationId: ["Structure ID introuvable."] },
    };
  }

  const existing = await db.structureInvitation.findUnique({
    where: {
      structureId_teamId: { structureId: structure.id, teamId: team.id },
    },
  });
  if (existing?.status === "PENDING") {
    return affiliationError("Une demande est déjà en attente.");
  }

  if (existing) {
    await db.structureInvitation.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        inviterId: userId,
        requestedByTeam: true,
        respondedAt: null,
      },
    });
  } else {
    await db.structureInvitation.create({
      data: {
        structureId: structure.id,
        teamId: team.id,
        inviterId: userId,
        requestedByTeam: true,
      },
    });
  }

  revalidatePath("/org");
  revalidatePath(`/org/${structure.id}`);
  revalidatePath("/manage");
  return {
    ok: true,
    message: `Demande envoyée à ${structure.tag} | ${structure.name}.`,
    fieldErrors: {},
  };
}

export async function respondToClubInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = clubInviteResponseSchema.safeParse({
    invitationId: formString(formData, "invitationId"),
    decision: formString(formData, "decision"),
  });
  if (!parsed.success) {
    return affiliationError("Invitation invalide.");
  }

  const invitation = await db.clubInvitation.findUnique({
    where: { id: parsed.data.invitationId },
    include: {
      parentTeam: { select: { id: true, name: true, managerId: true, orgId: true } },
      childTeam: {
        select: { id: true, name: true, managerId: true, orgId: true, parentTeamId: true },
      },
    },
  });

  if (!invitation || invitation.status !== "PENDING") {
    return affiliationError("Invitation introuvable ou déjà traitée.");
  }

  const admin = isAdmin(session.user.id);
  if (invitation.parentTeam.managerId !== session.user.id && !admin) {
    return affiliationError("Seul le manager du club parent peut répondre.");
  }

  if (parsed.data.decision === "refuse") {
    await db.clubInvitation.update({
      where: { id: invitation.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    revalidatePath("/manage");
    return { ok: true, message: "Demande d'académie refusée.", fieldErrors: {} };
  }

  if (invitation.childTeam.orgId || invitation.parentTeam.orgId) {
    await db.clubInvitation.update({
      where: { id: invitation.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    return affiliationError("Une des équipes est déjà dans une structure.");
  }

  if (await wouldCreateAcademyCycle(invitation.childTeamId, invitation.parentTeamId)) {
    return affiliationError("Cette affiliation créerait une boucle.");
  }

  await db.$transaction([
    db.team.update({
      where: { id: invitation.childTeamId },
      data: { parentTeamId: invitation.parentTeamId, orgId: null },
    }),
    db.clubInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
  ]);

  revalidateTeamViews(invitation.childTeamId);
  revalidateTeamViews(invitation.parentTeamId);
  return {
    ok: true,
    message: `${invitation.childTeam.name} rejoint le club ${invitation.parentTeam.name}.`,
    fieldErrors: {},
  };
}
