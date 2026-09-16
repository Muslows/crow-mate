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
  openTeamConversationSchema,
  sendChatMessageSchema,
} from "@/lib/validations/chat";

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
      recruiterId_candidateId: {
        recruiterId: session.user.id,
        candidateId: parsed.data.candidateUserId,
      },
    },
    create: {
      recruiterId: session.user.id,
      candidateId: parsed.data.candidateUserId,
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
      recruiterId_candidateId: {
        recruiterId: allowed.managerId,
        candidateId: session.user.id,
      },
    },
    create: {
      recruiterId: allowed.managerId,
      candidateId: session.user.id,
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

  await db.$transaction([
    db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        body: parsed.data.body,
      },
    }),
    db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversation.id}`);
  return { ok: true, message: null, fieldErrors: {} };
}
