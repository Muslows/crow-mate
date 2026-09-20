"use server";

import { revalidatePath } from "next/cache";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import { db } from "@/lib/db";
import { getOwnedStructure } from "@/lib/data/structures";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  structureIdSchema,
  structureInviteResponseSchema,
  structureSchema,
  teamAttachSchema,
} from "@/lib/validations/structure";
import {
  isAdminRole,
  requireAdminSession,
  requireAuthSession,
  sessionCapabilities,
} from "@/lib/session";
import { enqueueDiscordNotification } from "@/lib/discord/outbox";
import { scheduleDiscordDispatch } from "@/lib/discord/schedule";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Tu n'as pas accès à cette structure.",
    fieldErrors: {},
  };
}

function revalidateStructure(structureId: string) {
  revalidatePath("/admin");
  revalidatePath("/org");
  revalidatePath(`/org/${structureId}`);
  revalidatePath("/");
}

export async function createStructure(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const parsed = structureSchema.safeParse({
    name: formString(formData, "name"),
    tag: formString(formData, "tag"),
    ownerId: formString(formData, "ownerId"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs de la structure.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const owner = await db.user.findUnique({
    where: { id: parsed.data.ownerId },
    select: { id: true },
  });
  if (!owner) {
    return {
      ok: false,
      message: "Propriétaire introuvable.",
      fieldErrors: { ownerId: ["Compte introuvable."] },
    };
  }

  try {
    const structure = await db.structure.create({
      data: {
        name: parsed.data.name,
        tag: parsed.data.tag,
        ownerId: parsed.data.ownerId,
      },
    });
    revalidateStructure(structure.id);
    return {
      ok: true,
      message: `Structure ${structure.tag} créée.`,
      fieldErrors: {},
    };
  } catch {
    return {
      ok: false,
      message: "Ce tag est déjà utilisé.",
      fieldErrors: { tag: ["Tag déjà attribué."] },
    };
  }
}

export async function updateStructureOwner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const idResult = structureIdSchema.safeParse(formString(formData, "id"));
  const ownerId = formString(formData, "ownerId");
  if (!idResult.success || !ownerId) {
    return {
      ok: false,
      message: "Structure ou propriétaire manquant.",
      fieldErrors: {},
    };
  }

  const owner = await db.user.findUnique({
    where: { id: ownerId },
    select: { id: true },
  });
  if (!owner) {
    return {
      ok: false,
      message: "Propriétaire introuvable.",
      fieldErrors: { ownerId: ["Compte introuvable."] },
    };
  }

  await db.structure.update({
    where: { id: idResult.data },
    data: { ownerId },
  });
  revalidateStructure(idResult.data);
  return {
    ok: true,
    message: "Propriétaire mis à jour.",
    fieldErrors: {},
  };
}

async function ownedOrForbidden(structureId: string) {
  const session = await requireAuthSession();
  const admin = isAdminRole(sessionCapabilities(session));
  const structure = await getOwnedStructure(
    structureId,
    session.user.id,
    admin,
  );
  return { structure, session };
}

export async function inviteTeamToStructure(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = teamAttachSchema.safeParse({
    structureId: formString(formData, "structureId"),
    teamId: formString(formData, "teamId").trim(),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Team ID invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { structure, session } = await ownedOrForbidden(parsed.data.structureId);
  if (!structure || !session) return forbidden();

  const team = await db.team.findUnique({
    where: { id: parsed.data.teamId },
    select: { id: true, name: true, orgId: true, managerId: true },
  });
  if (!team) {
    return {
      ok: false,
      message: "Aucune équipe pour ce Team ID.",
      fieldErrors: { teamId: ["Team ID introuvable."] },
    };
  }

  if (team.orgId === structure.id) {
    return {
      ok: false,
      message: "Cette équipe est déjà dans la structure.",
      fieldErrors: { teamId: ["Déjà affiliée."] },
    };
  }

  if (team.orgId) {
    return {
      ok: false,
      message: "Cette équipe appartient déjà à une autre structure.",
      fieldErrors: { teamId: ["Déjà affiliée ailleurs."] },
    };
  }

  const existing = await db.structureInvitation.findUnique({
    where: {
      structureId_teamId: {
        structureId: structure.id,
        teamId: team.id,
      },
    },
  });

  if (existing?.status === "PENDING") {
    return {
      ok: false,
      message: "Une invitation est déjà en attente pour cette équipe.",
      fieldErrors: { teamId: ["Invitation déjà envoyée."] },
    };
  }

  if (existing?.status === "ACCEPTED") {
    return {
      ok: false,
      message: "Cette équipe est déjà liée à la structure.",
      fieldErrors: { teamId: ["Déjà affiliée."] },
    };
  }

  const invitation = existing
    ? await db.structureInvitation.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          inviterId: session.user.id,
          respondedAt: null,
        },
        select: { id: true },
      })
    : await db.structureInvitation.create({
        data: {
          structureId: structure.id,
          teamId: team.id,
          inviterId: session.user.id,
        },
        select: { id: true },
      });
  const enqueued = await enqueueDiscordNotification(db, {
    userId: team.managerId,
    teamId: team.id,
    type: "STRUCTURE_INVITE",
    dedupeKey: `structure-invite:${invitation.id}`,
    payload: { kind: "STRUCTURE_INVITE", structureName: structure.name },
  });
  if (enqueued) scheduleDiscordDispatch();

  revalidatePath("/manage");
  revalidateStructure(structure.id);
  return {
    ok: true,
    message: `Invitation envoyée au manager de ${team.name}.`,
    fieldErrors: {},
  };
}

export async function respondToStructureInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = structureInviteResponseSchema.safeParse({
    invitationId: formString(formData, "invitationId"),
    decision: formString(formData, "decision"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invitation invalide.",
      fieldErrors: {},
    };
  }

  const invitation = await db.structureInvitation.findUnique({
    where: { id: parsed.data.invitationId },
    include: {
      team: { select: { id: true, managerId: true, orgId: true, parentTeamId: true } },
      structure: { select: { id: true, name: true, tag: true, ownerId: true } },
    },
  });

  if (!invitation || invitation.status !== "PENDING") {
    return {
      ok: false,
      message: "Invitation introuvable ou déjà traitée.",
      fieldErrors: {},
    };
  }

  const admin = isAdminRole(sessionCapabilities(session));
  const isOwner = invitation.structure.ownerId === session.user.id;
  const isTeamManager = invitation.team.managerId === session.user.id;
  const responderOk = invitation.requestedByTeam
    ? isOwner || admin
    : isTeamManager || admin;

  if (!responderOk) {
    return forbidden();
  }

  if (parsed.data.decision === "refuse") {
    await db.structureInvitation.update({
      where: { id: invitation.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    revalidatePath("/manage");
    revalidateStructure(invitation.structureId);
    return {
      ok: true,
      message: "Invitation refusée.",
      fieldErrors: {},
    };
  }

  if (invitation.team.orgId) {
    await db.structureInvitation.update({
      where: { id: invitation.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    return {
      ok: false,
      message: "L'équipe est déjà affiliée à une structure.",
      fieldErrors: {},
    };
  }

  await db.$transaction([
    db.team.update({
      where: { id: invitation.teamId },
      data: { orgId: invitation.structureId, parentTeamId: null },
    }),
    db.structureInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
  ]);

  revalidateTeamViews(invitation.teamId);
  revalidateStructure(invitation.structureId);
  return {
    ok: true,
    message: `Équipe affiliée à ${invitation.structure.tag} | ${invitation.structure.name}.`,
    fieldErrors: {},
  };
}

export async function detachTeamFromStructure(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = teamAttachSchema.safeParse({
    structureId: formString(formData, "structureId"),
    teamId: formString(formData, "teamId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Équipe ou structure invalide.",
      fieldErrors: {},
    };
  }

  const { structure } = await ownedOrForbidden(parsed.data.structureId);
  if (!structure) return forbidden();

  await db.team.updateMany({
    where: { id: parsed.data.teamId, orgId: structure.id },
    data: { orgId: null },
  });
  revalidateTeamViews(parsed.data.teamId);
  revalidateStructure(structure.id);
  return {
    ok: true,
    message: "Équipe détachée. La structure est inchangée.",
    fieldErrors: {},
  };
}
