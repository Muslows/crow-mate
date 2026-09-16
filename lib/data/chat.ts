import { db } from "@/lib/db";
import { canRecruitViaChat } from "@/lib/access";
import { canBeRecruited } from "@/lib/roles";
import { publicDisplayName } from "@/lib/privacy";

const peerSelect = {
  id: true,
  name: true,
  isPlayer: true,
  isCoach: true,
  isManager: true,
  isStaff: true,
  role: true,
  playerProfile: { select: { id: true, displayName: true } },
} as const;

export type ChatMessageView = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

function toMessageView(row: {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
}): ChatMessageView {
  return {
    id: row.id,
    senderId: row.senderId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      recruiter: { select: peerSelect },
      candidate: { select: peerSelect },
    },
  });
  if (!conversation) return null;
  if (conversation.recruiterId !== userId && conversation.candidateId !== userId) {
    return null;
  }
  return conversation;
}

export async function listConversationsForUser(userId: string) {
  const rows = await db.conversation.findMany({
    where: {
      OR: [{ recruiterId: userId }, { candidateId: userId }],
    },
    include: {
      recruiter: { select: peerSelect },
      candidate: { select: peerSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false, senderId: { not: userId } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((row) => {
    const peer = row.recruiterId === userId ? row.candidate : row.recruiter;
    const last = row.messages[0];
    return {
      id: row.id,
      peerName: publicDisplayName({
        displayName: peer.playerProfile?.displayName,
        name: peer.name,
      }),
      peerProfileId: peer.playerProfile?.id ?? null,
      lastBody: last?.body ?? "",
      lastAt: (last?.createdAt ?? row.updatedAt).toISOString(),
      isRecruiter: row.recruiterId === userId,
      unreadCount: row._count.messages,
    };
  });
}

export async function countUnreadMessages(userId: string): Promise<number> {
  return db.chatMessage.count({
    where: {
      isRead: false,
      senderId: { not: userId },
      conversation: {
        OR: [{ recruiterId: userId }, { candidateId: userId }],
      },
    },
  });
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  await db.chatMessage.updateMany({
    where: {
      conversationId,
      isRead: false,
      senderId: { not: userId },
    },
    data: { isRead: true },
  });
}

export async function listMessagesForConversation(
  conversationId: string,
  userId: string,
  afterId?: string,
) {
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) return null;

  const after = afterId
    ? await db.chatMessage.findUnique({
        where: { id: afterId },
        select: { createdAt: true },
      })
    : null;

  const rows = await db.chatMessage.findMany({
    where: {
      conversationId,
      ...(after
        ? { createdAt: { gt: after.createdAt } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  await markConversationRead(conversationId, userId);

  return rows.map(toMessageView);
}

export function isRecruitableUser(user: {
  isPlayer: boolean;
  isCoach: boolean;
  role: string;
}) {
  return canBeRecruited(user);
}

export async function assertCanOpenChat(
  recruiterId: string,
  candidateId: string,
): Promise<string | null> {
  if (recruiterId === candidateId) {
    return "Tu ne peux pas t'écrire à toi-même.";
  }
  const allowed = await canRecruitViaChat(recruiterId);
  if (!allowed) {
    return "Seuls un manager ou un staff autorisé peuvent ouvrir un chat de recrutement.";
  }
  const candidate = await db.user.findUnique({
    where: { id: candidateId },
    select: { isPlayer: true, isCoach: true, role: true },
  });
  if (!candidate || !isRecruitableUser(candidate)) {
    return "Ce compte n'est pas un joueur ou un coach contactable.";
  }
  return null;
}

export async function assertCanContactTeam(
  playerId: string,
  teamId: string,
): Promise<{ managerId: string } | { error: string }> {
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { id: true, managerId: true },
  });
  if (!team) return { error: "Équipe introuvable." };
  if (team.managerId === playerId) {
    return { error: "Tu gères déjà cette équipe." };
  }
  const player = await db.user.findUnique({
    where: { id: playerId },
    select: { isPlayer: true, isCoach: true, role: true },
  });
  if (!player || !isRecruitableUser(player)) {
    return { error: "Seuls un joueur ou un coach peuvent contacter une équipe." };
  }
  return { managerId: team.managerId };
}
