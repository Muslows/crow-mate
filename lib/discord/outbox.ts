import { randomUUID } from "node:crypto";
import { DiscordApiError, sendDiscordDirectMessage } from "@/lib/discord/api";
import { discordServerConfig } from "@/lib/discord/config";
import { db } from "@/lib/db";
import type {
  DiscordNotificationType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

type DbClient = Prisma.TransactionClient | PrismaClient;

export type DiscordNotificationPayload =
  | {
      kind: "SCRIM_PROPOSAL";
      fromTeamName: string;
      estimatedSr: number;
      when: string;
    }
  | {
      kind: "CHAT_MESSAGE";
      senderName: string;
    }
  | {
      kind: "SCRIM_CANCELLED";
      when: string;
      cancelledByTeamName: string;
      reason: string;
    }
  | {
      kind: "TEAM_INVITE";
      teamName: string;
    }
  | {
      kind: "STRUCTURE_INVITE";
      structureName: string;
      teamName?: string;
    }
  | {
      kind: "CLUB_INVITE";
      clubName: string;
      teamName: string;
    };

const EMBED_COLOR = 0xea580c;

const PREFERENCE_BY_TYPE: Record<
  DiscordNotificationType,
  | "notifyDiscordMessages"
  | "notifyDiscordInvitations"
  | "notifyDiscordScrims"
  | "notifyDiscordCancellations"
> = {
  CHAT_MESSAGE: "notifyDiscordMessages",
  TEAM_INVITE: "notifyDiscordInvitations",
  STRUCTURE_INVITE: "notifyDiscordInvitations",
  CLUB_INVITE: "notifyDiscordInvitations",
  SCRIM_PROPOSAL: "notifyDiscordScrims",
  SCRIM_CANCELLED: "notifyDiscordCancellations",
};

function embedFor(payload: DiscordNotificationPayload) {
  const stamp = {
    timestamp: new Date().toISOString(),
    author: { name: "Crow-mate · Esport" },
    footer: { text: "Crow-mate" },
  };
  switch (payload.kind) {
    case "TEAM_INVITE":
      return {
        title: "Invitation de recrutement",
        description: `L'équipe **${payload.teamName}** vous invite à rejoindre son roster.`,
        color: EMBED_COLOR,
        fields: [{ name: "Statut", value: "En attente", inline: true }],
        ...stamp,
      };
    case "SCRIM_PROPOSAL":
      return {
        title: "Proposition de Scrim",
        description: `L'équipe **${payload.fromTeamName}** (SR ${payload.estimatedSr}) vous propose un Scrim pour **${payload.when}**.`,
        color: EMBED_COLOR,
        ...stamp,
      };
    case "STRUCTURE_INVITE":
      return {
        title: "Affiliation de structure",
        description: payload.teamName
          ? `L'équipe **${payload.teamName}** souhaite rejoindre la structure **${payload.structureName}**.`
          : `La structure **${payload.structureName}** souhaite affilier votre équipe.`,
        color: EMBED_COLOR,
        ...stamp,
      };
    case "CLUB_INVITE":
      return {
        title: "Affiliation de club",
        description: `L'équipe **${payload.teamName}** souhaite rejoindre le club **${payload.clubName}**.`,
        color: EMBED_COLOR,
        ...stamp,
      };
    case "CHAT_MESSAGE":
      return {
        title: "Nouveau message privé",
        description: `Vous avez reçu un nouveau message privé de **${payload.senderName}**.`,
        color: EMBED_COLOR,
        ...stamp,
      };
    case "SCRIM_CANCELLED":
      return {
        title: "Alerte — Scrim annulé",
        description: `🚨 ALERTE : Le Scrim **${payload.when}** a été annulé par l'équipe adverse.`,
        color: 0xdc2626,
        fields: [
          { name: "Raison", value: payload.reason.slice(0, 1024), inline: false },
        ],
        ...stamp,
      };
  }
}

export async function enqueueDiscordNotification(
  client: DbClient,
  input: {
    userId: string;
    teamId?: string | null;
    type: DiscordNotificationType;
    dedupeKey: string;
    payload: DiscordNotificationPayload;
  },
) {
  const preference = PREFERENCE_BY_TYPE[input.type];
  const recipient = await client.user.findUnique({
    where: { id: input.userId },
    select: {
      discordId: true,
      notifyDiscordMessages: true,
      notifyDiscordInvitations: true,
      notifyDiscordScrims: true,
      notifyDiscordCancellations: true,
    },
  });
  if (!recipient?.discordId) {
    console.info("[discord] skip", {
      type: input.type,
      userId: input.userId,
      reason: "no_discord_id",
    });
    return false;
  }
  if (!recipient[preference]) {
    console.info("[discord] skip", {
      type: input.type,
      userId: input.userId,
      reason: "preference_off",
    });
    return false;
  }
  await client.notificationOutbox.upsert({
    where: { dedupeKey: input.dedupeKey },
    create: {
      userId: input.userId,
      teamId: input.teamId ?? null,
      type: input.type,
      dedupeKey: input.dedupeKey,
      payload: input.payload as Prisma.InputJsonValue,
    },
    update: {},
  });
  console.info("[discord] enqueue", {
    type: input.type,
    userId: input.userId,
    dedupeKey: input.dedupeKey,
  });
  return true;
}

function parsePayload(value: Prisma.JsonValue): DiscordNotificationPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const kind = "kind" in value ? value.kind : null;
  if (
    kind !== "SCRIM_PROPOSAL" &&
    kind !== "CHAT_MESSAGE" &&
    kind !== "SCRIM_CANCELLED" &&
    kind !== "TEAM_INVITE" &&
    kind !== "STRUCTURE_INVITE" &&
    kind !== "CLUB_INVITE"
  ) {
    return null;
  }
  return value as unknown as DiscordNotificationPayload;
}

function retryDelay(attempts: number): number {
  return Math.min(60 * 60 * 1000, 15_000 * 2 ** Math.min(attempts, 8));
}

export async function dispatchDiscordOutbox(limit = 20) {
  const config = discordServerConfig();
  if (!config) return { processed: 0, sent: 0 };
  const now = new Date();
  const staleLock = new Date(now.getTime() - 5 * 60 * 1000);
  const lockToken = randomUUID();

  const claimed = await db.$transaction(async (tx) => {
    await tx.notificationOutbox.updateMany({
      where: { status: "PROCESSING", lockedAt: { lt: staleLock } },
      data: {
        status: "FAILED",
        lockToken: null,
        lockedAt: null,
        nextAttemptAt: now,
        lastError: "Verrou de livraison expiré.",
      },
    });
    const candidates = await tx.notificationOutbox.findMany({
      where: {
        status: { in: ["PENDING", "FAILED"] },
        attempts: { lt: 8 },
        nextAttemptAt: { lte: now },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: Math.max(1, Math.min(limit, 50)),
    });
    if (candidates.length === 0) return [];
    await tx.notificationOutbox.updateMany({
      where: {
        id: { in: candidates.map((candidate) => candidate.id) },
        status: { in: ["PENDING", "FAILED"] },
      },
      data: {
        status: "PROCESSING",
        lockedAt: now,
        lockToken,
      },
    });
    return tx.notificationOutbox.findMany({
      where: { lockToken, status: "PROCESSING" },
      include: {
        user: {
          select: {
            id: true,
            discordId: true,
            notifyDiscordMessages: true,
            notifyDiscordInvitations: true,
            notifyDiscordScrims: true,
            notifyDiscordCancellations: true,
          },
        },
      },
    });
  });

  let sent = 0;
  for (const item of claimed) {
    const payload = parsePayload(item.payload);
    const discordId = item.user.discordId;
    const preference = PREFERENCE_BY_TYPE[item.type];
    if (preference && !item.user[preference]) {
      await db.notificationOutbox.update({
        where: { id: item.id },
        data: {
          status: "FAILED",
          attempts: 8,
          lockToken: null,
          lockedAt: null,
          lastError: "Préférence Discord désactivée.",
        },
      });
      continue;
    }
    if (!discordId || !payload) {
      await db.notificationOutbox.update({
        where: { id: item.id },
        data: {
          status: "FAILED",
          attempts: 8,
          lockToken: null,
          lockedAt: null,
          lastError: payload
            ? "Compte Discord non associé."
            : "Payload de notification invalide.",
        },
      });
      continue;
    }

    try {
      await sendDiscordDirectMessage(config, discordId, embedFor(payload));
      await db.$transaction([
        db.notificationOutbox.update({
          where: { id: item.id },
          data: {
            status: "SENT",
            attempts: { increment: 1 },
            lockToken: null,
            lockedAt: null,
            sentAt: new Date(),
            lastError: "",
            payload: { kind: payload.kind },
          },
        }),
        db.user.update({
          where: { id: item.user.id },
          data: { discordDmBlocked: false },
        }),
      ]);
      sent += 1;
    } catch (error) {
      const attempts = item.attempts + 1;
      const apiError = error instanceof DiscordApiError ? error : null;
      const cannotDm = Boolean(apiError?.cannotDm);
      const permanent =
        cannotDm ||
        apiError?.status === 403 ||
        apiError?.status === 404 ||
        attempts >= 8;
      const delay = apiError?.retryAfterMs ?? retryDelay(attempts);
      const message =
        error instanceof Error ? error.message.slice(0, 300) : "Erreur Discord";
      await db.$transaction([
        db.notificationOutbox.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            attempts: permanent ? 8 : attempts,
            lockToken: null,
            lockedAt: null,
            nextAttemptAt: permanent
              ? new Date("9999-12-31T00:00:00.000Z")
              : new Date(Date.now() + delay),
            lastError: cannotDm
              ? apiError?.noMutualGuild
                ? "Aucun serveur Discord en commun (50278)."
                : "MP Discord bloqués (50007)."
              : message,
          },
        }),
        db.user.update({
          where: { id: item.user.id },
          data: { discordDmBlocked: cannotDm ? true : undefined },
        }),
      ]);
    }
  }

  return { processed: claimed.length, sent };
}
