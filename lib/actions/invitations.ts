"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { canInvitePlayersToTeam } from "@/lib/access";
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
import { defaultRosterRole } from "@/lib/specialties";
import { upsertTeamMembership } from "@/lib/team-membership";
import { requireAuthSession } from "@/lib/session";
import { enqueueDiscordNotification } from "@/lib/discord/outbox";
import { scheduleDiscordDispatch } from "@/lib/discord/schedule";

function invitationError(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function createInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = createInvitationSchema.safeParse({
    teamId: formString(formData, "teamId"),
    playerId: formString(formData, "playerId"),
    message: formString(formData, "message"),
    kind: formString(formData, "kind") || "PLAYER",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie l'invitation.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const allowed = await canInvitePlayersToTeam(
    parsed.data.teamId,
    session.user.id,
  );
  if (!allowed) {
    return invitationError(
      "Seul le manager ou le coach d'équipe peut envoyer une invitation.",
    );
  }

  const team = await db.team.findUnique({
    where: { id: parsed.data.teamId },
    select: {
      id: true,
      name: true,
    },
  });
  if (!team) {
    return invitationError("Équipe introuvable.");
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

  if (parsed.data.kind === "COACH") {
    if (profile.user.openToCoach !== "OPEN") {
      return invitationError(
        "Ce profil n'est pas ouvert au coaching (Open to Coach).",
      );
    }
    const alreadyCoach = await db.teamMembership.findUnique({
      where: {
        teamId_userId: { teamId: team.id, userId: profile.userId },
      },
    });
    if (alreadyCoach) {
      return invitationError("Ce profil est déjà membre de l'équipe.");
    }
  } else {
    const alreadyOnRoster = await db.teamMembership.findUnique({
      where: {
        teamId_userId: { teamId: team.id, userId: profile.userId },
      },
    });
    if (alreadyOnRoster) {
      return invitationError("Ce joueur est déjà dans le roster.");
    }
  }

  try {
    const existing = await db.teamInvitation.findUnique({
      where: {
        teamId_inviteeId: { teamId: team.id, inviteeId: profile.userId },
      },
    });

    if (existing?.status === "PENDING") {
      return invitationError("Une invitation est déjà en attente pour ce compte.");
    }

    if (existing?.status === "ACCEPTED") {
      if (parsed.data.kind === "COACH") {
        const stillCoach = await db.teamCoach.findUnique({
          where: {
            teamId_userId: { teamId: team.id, userId: profile.userId },
          },
        });
        if (stillCoach) {
          return invitationError("Cette invitation coach a déjà été acceptée.");
        }
      } else {
        const stillOnTeam = await db.player.findFirst({
          where: { teamId: team.id, userId: profile.userId },
        });
        if (stillOnTeam) {
          return invitationError("Cette invitation a déjà été acceptée.");
        }
      }
    }

    const invitation = existing
      ? await db.teamInvitation.update({
          where: { id: existing.id },
          data: {
            status: "PENDING",
            kind: parsed.data.kind,
            message: parsed.data.message,
            inviterId: session.user.id,
            respondedAt: null,
          },
          select: { id: true },
        })
      : await db.teamInvitation.create({
          data: {
            teamId: team.id,
            inviterId: session.user.id,
            inviteeId: profile.userId,
            message: parsed.data.message,
            status: "PENDING",
            kind: parsed.data.kind,
          },
          select: { id: true },
        });
    const enqueued = await enqueueDiscordNotification(db, {
      userId: profile.userId,
      teamId: team.id,
      type: "TEAM_INVITE",
      dedupeKey: `team-invite:${invitation.id}`,
      payload: { kind: "TEAM_INVITE", teamName: team.name },
    });
    if (enqueued) scheduleDiscordDispatch();

    revalidatePath("/profile");
    revalidatePath("/manage");
    revalidatePath(`/manage/teams/${team.id}/edit`);
    revalidatePath(`/players/${profile.id}`);
    return {
      ok: true,
      message:
        parsed.data.kind === "COACH"
          ? `${profile.user.name} a été invité comme coach.`
          : `${profile.user.name} a été ajouté à la liste d'attente.`,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("createInvitation", error);
    return invitationError("Impossible d'envoyer l'invitation pour le moment.");
  }
}

export async function respondToInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
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
      team: { select: { id: true, name: true, leadership: true, format: true } },
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

  if (invitation.kind === "COACH") {
    await db.$transaction(async (tx) => {
      await upsertTeamMembership(tx, {
        teamId: invitation.teamId,
        userId: session.user.id,
        orgRoles: ["COACH"],
      });
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });
    });
    revalidateTeamViews(invitation.teamId);
    revalidatePath("/profile");
    return {
      ok: true,
      message: `Tu es désormais coach officiel de ${invitation.team.name}.`,
      fieldErrors: {},
    };
  }

  const profile = invitation.invitee.playerProfile;
  if (!profile) {
    return invitationError("Active d'abord ton profil joueur.");
  }

  const incomingRole = defaultRosterRole(profile.openToPlay, profile.role);

  await db.$transaction(async (tx) => {
    await upsertTeamMembership(tx, {
      teamId: invitation.teamId,
      userId: session.user.id,
      playerRole: incomingRole,
      orgRoles: ["PLAYER"],
    });
    await tx.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    await tx.playerProfile.update({
      where: { id: profile.id },
      data: { recruitmentStatus: "NOT_LOOKING" },
    });
  });

  revalidateTeamViews(invitation.teamId, profile.id);
  revalidatePath("/profile");
  return {
    ok: true,
    message: `Tu as rejoint ${invitation.team.name}.`,
    fieldErrors: {},
  };
}
