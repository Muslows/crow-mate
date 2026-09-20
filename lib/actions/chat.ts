"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
  type OpenConversationState,
} from "@/lib/actions/state";
import {
  assertCanContactTeam,
  assertCanOpenChat,
  getConversationForUser,
} from "@/lib/data/chat";
import { requireAuthSession } from "@/lib/session";
import {
  openConversationSchema,
  openLfsConversationSchema,
  openOpenPositionConversationSchema,
  openScrimConversationSchema,
  openTeamConversationSchema,
  openValidatedScrimConversationSchema,
  sendChatMessageSchema,
} from "@/lib/validations/chat";
import {
  canRespondToScrimProposal,
  canViewTeamMatchCenter,
} from "@/lib/access";
import { enqueueDiscordNotification } from "@/lib/discord/outbox";
import { openPositionApplyMessage } from "@/lib/lfp";
import { scheduleDiscordDispatch } from "@/lib/discord/schedule";

export async function openConversation(
  _prev: OpenConversationState,
  formData: FormData,
): Promise<OpenConversationState> {
  const session = await requireAuthSession();
  const parsed = openConversationSchema.safeParse({
    candidateUserId: formString(formData, "candidateUserId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Destinataire invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      conversationId: null,
    };
  }

  const blocked = await assertCanOpenChat(
    session.user.id,
    parsed.data.candidateUserId,
  );
  if (blocked) {
    return {
      ok: false,
      message: blocked,
      fieldErrors: {},
      conversationId: null,
    };
  }

  const conversation = await db.conversation.upsert({
    where: {
      recruiterId_candidateId_contextKey: {
        recruiterId: session.user.id,
        candidateId: parsed.data.candidateUserId,
        contextKey: "direct",
      },
    },
    create: {
      recruiterId: session.user.id,
      candidateId: parsed.data.candidateUserId,
      contextType: "DIRECT",
      contextKey: "direct",
    },
    update: {},
    select: { id: true },
  });

  revalidatePath("/messages");
  return {
    ok: true,
    message: null,
    fieldErrors: {},
    conversationId: conversation.id,
  };
}

export async function openLfsConversation(
  _prev: OpenConversationState,
  formData: FormData,
): Promise<OpenConversationState> {
  const session = await requireAuthSession();
  const parsed = openLfsConversationSchema.safeParse({
    announcementId: formString(formData, "announcementId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Annonce introuvable.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      conversationId: null,
    };
  }

  const announcement = await db.announcement.findUnique({
    where: { id: parsed.data.announcementId },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      createdById: true,
      teamId: true,
    },
  });
  if (
    !announcement ||
    announcement.status !== "ACTIVE" ||
    announcement.expiresAt.getTime() <= Date.now()
  ) {
    return {
      ok: false,
      message: "Ce LFS n’est plus actif.",
      fieldErrors: {},
      conversationId: null,
    };
  }
  if (announcement.createdById === session.user.id) {
    return {
      ok: false,
      message: "C’est ton propre LFS.",
      fieldErrors: {},
      conversationId: null,
    };
  }

  const [left, right] = [session.user.id, announcement.createdById].sort();
  const contextKey = `lfs:${announcement.id}`;
  const conversation = await db.conversation.upsert({
    where: {
      recruiterId_candidateId_contextKey: {
        recruiterId: left,
        candidateId: right,
        contextKey,
      },
    },
    create: {
      recruiterId: left,
      candidateId: right,
      contextType: "SCRIM",
      contextKey,
      contextTeamId: announcement.teamId,
    },
    update: {},
    select: { id: true },
  });

  revalidatePath("/messages");
  return {
    ok: true,
    message: null,
    fieldErrors: {},
    conversationId: conversation.id,
  };
}

export async function openTeamConversation(
  _prev: OpenConversationState,
  formData: FormData,
): Promise<OpenConversationState> {
  const session = await requireAuthSession();
  const parsed = openTeamConversationSchema.safeParse({
    teamId: formString(formData, "teamId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Équipe invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      conversationId: null,
    };
  }

  const allowed = await assertCanContactTeam(session.user.id, parsed.data.teamId);
  if ("error" in allowed) {
    return {
      ok: false,
      message: allowed.error,
      fieldErrors: {},
      conversationId: null,
    };
  }

  const conversation = await db.conversation.upsert({
    where: {
      recruiterId_candidateId_contextKey: {
        recruiterId: allowed.managerId,
        candidateId: session.user.id,
        contextKey: `recruitment:${parsed.data.teamId}`,
      },
    },
    create: {
      recruiterId: allowed.managerId,
      candidateId: session.user.id,
      contextType: "RECRUITMENT",
      contextKey: `recruitment:${parsed.data.teamId}`,
      contextTeamId: parsed.data.teamId,
    },
    update: {},
    select: { id: true },
  });

  revalidatePath("/messages");
  return {
    ok: true,
    message: null,
    fieldErrors: {},
    conversationId: conversation.id,
  };
}

export async function openOpenPositionConversation(
  _prev: OpenConversationState,
  formData: FormData,
): Promise<OpenConversationState> {
  const session = await requireAuthSession();
  const parsed = openOpenPositionConversationSchema.safeParse({
    positionId: formString(formData, "positionId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Poste introuvable.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      conversationId: null,
    };
  }

  const position = await db.openPosition.findUnique({
    where: { id: parsed.data.positionId },
    select: {
      id: true,
      role: true,
      teamId: true,
      team: { select: { managerId: true, name: true } },
    },
  });
  if (!position) {
    return {
      ok: false,
      message: "Ce poste n’est plus ouvert.",
      fieldErrors: {},
      conversationId: null,
    };
  }
  if (position.team.managerId === session.user.id) {
    return {
      ok: false,
      message: "C’est le poste de ton équipe.",
      fieldErrors: {},
      conversationId: null,
    };
  }

  const [onRoster, existingApp] = await Promise.all([
    db.player.findFirst({
      where: { teamId: position.teamId, userId: session.user.id },
      select: { id: true },
    }),
    db.openPositionApplication.findUnique({
      where: {
        positionId_playerId: {
          positionId: position.id,
          playerId: session.user.id,
        },
      },
      select: { id: true, conversationId: true },
    }),
  ]);
  if (onRoster) {
    return {
      ok: false,
      message: "Tu es déjà dans cette équipe.",
      fieldErrors: {},
      conversationId: null,
    };
  }

  const conversation = await db.conversation.upsert({
    where: {
      recruiterId_candidateId_contextKey: {
        recruiterId: position.team.managerId,
        candidateId: session.user.id,
        contextKey: `open-position:${position.id}`,
      },
    },
    create: {
      recruiterId: position.team.managerId,
      candidateId: session.user.id,
      contextType: "OPEN_POSITION",
      contextKey: `open-position:${position.id}`,
      contextTeamId: position.teamId,
    },
    update: {},
    select: { id: true },
  });

  if (!existingApp) {
    await db.openPositionApplication.create({
      data: {
        positionId: position.id,
        playerId: session.user.id,
        conversationId: conversation.id,
      },
    });
    const alreadyMessaged = await db.chatMessage.count({
      where: { conversationId: conversation.id },
    });
    if (alreadyMessaged === 0) {
      await db.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          body: openPositionApplyMessage(position.role),
        },
      });
    }
  }

  revalidatePath("/messages");
  revalidatePath(`/teams/${position.teamId}`);
  return {
    ok: true,
    message: null,
    fieldErrors: {},
    conversationId: conversation.id,
  };
}

export async function openScrimConversation(
  _prev: OpenConversationState,
  formData: FormData,
): Promise<OpenConversationState> {
  const session = await requireAuthSession();
  const parsed = openScrimConversationSchema.safeParse({
    proposalId: formString(formData, "proposalId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Proposition invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      conversationId: null,
    };
  }

  const proposal = await db.scrimProposal.findUnique({
    where: { id: parsed.data.proposalId },
    select: {
      status: true,
      toTeamId: true,
      fromTeam: { select: { managerId: true } },
      toTeam: { select: { managerId: true } },
    },
  });
  if (
    !proposal ||
    proposal.status !== "PENDING" ||
    !(await canRespondToScrimProposal(proposal.toTeamId, session.user.id))
  ) {
    return {
      ok: false,
      message: "Cette proposition n’est pas accessible.",
      fieldErrors: {},
      conversationId: null,
    };
  }

  if (proposal.fromTeam.managerId === proposal.toTeam.managerId) {
    return {
      ok: false,
      message: "Tu ne peux pas t’écrire à toi-même.",
      fieldErrors: {},
      conversationId: null,
    };
  }

  const contextKey = `scrim:${parsed.data.proposalId}`;
  const conversation = await db.conversation.upsert({
    where: {
      recruiterId_candidateId_contextKey: {
        recruiterId: proposal.fromTeam.managerId,
        candidateId: proposal.toTeam.managerId,
        contextKey,
      },
    },
    create: {
      recruiterId: proposal.fromTeam.managerId,
      candidateId: proposal.toTeam.managerId,
      contextType: "SCRIM",
      contextKey,
      scrimProposalId: parsed.data.proposalId,
    },
    update: {},
    select: { id: true },
  });

  revalidatePath("/messages");
  return {
    ok: true,
    message: null,
    fieldErrors: {},
    conversationId: conversation.id,
  };
}

export async function openValidatedScrimConversation(
  _prev: OpenConversationState,
  formData: FormData,
): Promise<OpenConversationState> {
  const session = await requireAuthSession();
  const parsed = openValidatedScrimConversationSchema.safeParse({
    proposalId: formString(formData, "proposalId"),
    viewerTeamId: formString(formData, "viewerTeamId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Scrim invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      conversationId: null,
    };
  }

  const proposal = await db.scrimProposal.findUnique({
    where: { id: parsed.data.proposalId },
    select: {
      status: true,
      fromTeamId: true,
      toTeamId: true,
      fromTeam: { select: { managerId: true } },
      toTeam: { select: { managerId: true } },
    },
  });
  const participates =
    proposal?.fromTeamId === parsed.data.viewerTeamId ||
    proposal?.toTeamId === parsed.data.viewerTeamId;
  if (
    !proposal ||
    proposal.status !== "ACCEPTED" ||
    !participates ||
    !(await canViewTeamMatchCenter(
      parsed.data.viewerTeamId,
      session.user.id,
    ))
  ) {
    return {
      ok: false,
      message: "Ce scrim n’est pas accessible.",
      fieldErrors: {},
      conversationId: null,
    };
  }

  if (proposal.fromTeam.managerId === proposal.toTeam.managerId) {
    return {
      ok: false,
      message: "Tu es déjà responsable des deux équipes.",
      fieldErrors: {},
      conversationId: null,
    };
  }
  const contextKey = `scrim:${parsed.data.proposalId}`;
  const conversation = await db.conversation.upsert({
    where: {
      recruiterId_candidateId_contextKey: {
        recruiterId: proposal.fromTeam.managerId,
        candidateId: proposal.toTeam.managerId,
        contextKey,
      },
    },
    create: {
      recruiterId: proposal.fromTeam.managerId,
      candidateId: proposal.toTeam.managerId,
      contextType: "SCRIM",
      contextKey,
      scrimProposalId: parsed.data.proposalId,
    },
    update: {},
    select: { id: true },
  });

  revalidatePath("/messages");
  return {
    ok: true,
    message: null,
    fieldErrors: {},
    conversationId: conversation.id,
  };
}

export async function sendChatMessage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = sendChatMessageSchema.safeParse({
    conversationId: formString(formData, "conversationId"),
    body: formString(formData, "body"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Message invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const conversation = await getConversationForUser(
    parsed.data.conversationId,
    session.user.id,
  );
  if (!conversation) {
    return {
      ok: false,
      message: "Conversation introuvable.",
      fieldErrors: {},
    };
  }

  const recipientId =
    conversation.recruiterId === session.user.id
      ? conversation.candidateId
      : conversation.recruiterId;

  let enqueued = false;
  await db.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        body: parsed.data.body,
      },
      select: { id: true },
    });
    await tx.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    enqueued = await enqueueDiscordNotification(tx, {
      userId: recipientId,
      teamId: conversation.contextTeamId,
      type: "CHAT_MESSAGE",
      dedupeKey: `chat:${message.id}`,
      payload: {
        kind: "CHAT_MESSAGE",
        senderName: session.user.name,
      },
    });
  });
  if (enqueued) scheduleDiscordDispatch();

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversation.id}`);
  return { ok: true, message: null, fieldErrors: {} };
}
