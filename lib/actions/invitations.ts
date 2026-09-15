"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { fallbackBattleTag } from "@/lib/battletag";
import { getOwnedTeam } from "@/lib/data/teams";
import { resolvePlayerAccount } from "@/lib/data/profiles";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  createInvitationSchema,
  respondInvitationSchema,
} from "@/lib/validations/invitation";
import { rankFromSr } from "@/lib/rank";
import {
  requireManagerSession,
  requirePlayerSession,
  sessionRole,
} from "@/lib/session";

function invitationError(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function createInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireManagerSession();
  const parsed = createInvitationSchema.safeParse({
    teamId: formString(formData, "teamId"),
    playerId: formString(formData, "playerId"),
    message: formString(formData, "message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie l'invitation.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const team = await getOwnedTeam(
    parsed.data.teamId,
    session.user.id,
    sessionRole(session),
  );
  if (!team) {
    return invitationError("Tu ne peux inviter que dans tes équipes.");
  }

  const profile = await resolvePlayerAccount(parsed.data.playerId);
  if (!profile) {
    return {
      ok: false,
      message: "Aucun compte joueur pour cet ID.",
      fieldErrors: { playerId: ["Player ID introuvable"] },
    };
  }

  if (profile.userId === session.user.id) {
    return invitationError("Tu ne peux pas t'inviter toi-même.");
  }

  const alreadyOnRoster = await db.player.findFirst({
    where: { teamId: team.id, userId: profile.userId },
  });
  if (alreadyOnRoster) {
    return invitationError("Ce joueur est déjà dans le roster.");
  }

  if (
    profile.recruitmentStatus !== "LOOKING" ||
    (await db.player.count({
      where: { userId: profile.userId, team: { isNot: null } },
    })) > 0
  ) {
    return invitationError("Ce joueur ne recherche pas d'équipe.");
  }

  const existing = await db.teamInvitation.findUnique({
    where: {
      teamId_inviteeId: { teamId: team.id, inviteeId: profile.userId },
    },
  });

  if (existing?.status === "PENDING") {
    return invitationError("Une invitation est déjà en attente pour ce joueur.");
  }

  if (existing?.status === "ACCEPTED") {
    const stillOnTeam = await db.player.findFirst({
      where: { teamId: team.id, userId: profile.userId },
    });
    if (stillOnTeam) {
      return invitationError("Cette invitation a déjà été acceptée.");
    }
  }

  if (existing) {
    await db.teamInvitation.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        message: parsed.data.message,
        inviterId: session.user.id,
        respondedAt: null,
      },
    });
  } else {
    await db.teamInvitation.create({
      data: {
        teamId: team.id,
        inviterId: session.user.id,
        inviteeId: profile.userId,
        message: parsed.data.message,
        status: "PENDING",
      },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/manage");
  revalidatePath(`/manage/teams/${team.id}/edit`);
  revalidatePath(`/players/${profile.id}`);
  return {
    ok: true,
    message: `${profile.user.name} a été ajouté à la liste d'attente.`,
    fieldErrors: {},
  };
}

export async function respondToInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requirePlayerSession();
  const parsed = respondInvitationSchema.safeParse({
    invitationId: formString(formData, "invitationId"),
    decision: formString(formData, "decision"),
  });

  if (!parsed.success) {
    return invitationError("Invitation invalide.");
  }

  const invitation = await db.teamInvitation.findUnique({
    where: { id: parsed.data.invitationId },
    include: {
      team: { select: { id: true, name: true } },
      invitee: {
        include: { playerProfile: true },
      },
    },
  });

  if (!invitation || invitation.inviteeId !== session.user.id) {
    return invitationError("Cette invitation ne t'est pas destinée.");
  }

  if (invitation.status !== "PENDING") {
    return invitationError("Cette invitation a déjà été traitée.");
  }

  if (parsed.data.decision === "refuse") {
    await db.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    revalidatePath("/profile");
    revalidatePath(`/manage/teams/${invitation.teamId}/edit`);
    return {
      ok: true,
      message: `Invitation de ${invitation.team.name} refusée.`,
      fieldErrors: {},
    };
  }

  const profile = invitation.invitee.playerProfile;
  if (!profile) {
    return invitationError("Active d'abord ton profil joueur.");
  }

  const battleTag =
    profile.battleTag.trim() ||
    fallbackBattleTag(invitation.invitee.name, invitation.inviteeId);

  await db.$transaction([
    db.player.upsert({
      where: {
        teamId_userId: {
          teamId: invitation.teamId,
          userId: session.user.id,
        },
      },
      create: {
        teamId: invitation.teamId,
        userId: session.user.id,
        battleTag,
        role: profile.primaryRole,
        secondaryRole: profile.secondaryRole,
        sr: profile.sr,
        rankDivision: rankFromSr(profile.sr),
        status: "TRIAL",
        favoriteHeroes: profile.favoriteHeroes,
        experience: profile.experience,
      },
      update: {
        battleTag,
        role: profile.primaryRole,
        secondaryRole: profile.secondaryRole,
        sr: profile.sr,
        rankDivision: rankFromSr(profile.sr),
        favoriteHeroes: profile.favoriteHeroes,
        experience: profile.experience,
      },
    }),
    db.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
    db.playerProfile.update({
      where: { id: profile.id },
      data: { recruitmentStatus: "NOT_LOOKING" },
    }),
  ]);

  revalidateTeamViews(invitation.teamId, profile.id);
  revalidatePath("/profile");
  return {
    ok: true,
    message: `Tu as rejoint ${invitation.team.name}.`,
    fieldErrors: {},
  };
}
