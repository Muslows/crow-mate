import {
  DiscordApiError,
  deleteDiscordChannelMessage,
  sendDiscordChannelMessage,
} from "@/lib/discord/api";
import { embedForAnnouncement } from "@/lib/discord/announcements";
import { discordServerConfig } from "@/lib/discord/config";
import {
  listConfiguredServers,
  type DiscordAnnounceKind,
} from "@/lib/discord/server-config";
import { db } from "@/lib/db";
import type { AnnouncementType } from "@prisma/client";

export async function targetServersForLfs() {
  return listConfiguredServers("scrim");
}

export async function targetServersForAnnouncement(type: AnnouncementType) {
  const kind: DiscordAnnounceKind =
    type === "LFP" || type === "PLAYER"
      ? "player"
      : type === "TEAM"
        ? "team"
        : type === "SUB"
          ? "ringer"
          : "scrim";
  return listConfiguredServers(kind);
}

async function forgetServerConfig(guildId: string, reason: string) {
  if (!guildId) return;
  try {
    await db.$executeRaw`
      DELETE FROM "DiscordServerConfig" WHERE "guildId" = ${guildId}
    `;
    console.warn("[discord] server config removed", { guildId, reason });
  } catch {
    // Already gone.
  }
}

function lostAccess(error: DiscordApiError | null) {
  if (!error) return false;
  return (
    error.status === 403 ||
    error.status === 404 ||
    error.code === 50001 ||
    error.code === 50013 ||
    error.code === 10003 ||
    error.code === 10004
  );
}

async function claimPendingPosts(limit: number) {
  const stale = new Date(Date.now() - 2 * 60 * 1000);
  await db.announcementPost.updateMany({
    where: { status: "SENDING", updatedAt: { lt: stale } },
    data: { status: "PENDING", lastError: "Verrou de publication expiré." },
  });
  const claimed = await db.$queryRaw<{ id: string }[]>`
    WITH picked AS (
      SELECT p.id
      FROM "AnnouncementPost" p
      INNER JOIN "Announcement" a ON a.id = p."announcementId"
      WHERE p.status = 'PENDING'
        AND a.status = 'ACTIVE'
      ORDER BY p."createdAt" ASC
      LIMIT ${limit}
      FOR UPDATE OF p SKIP LOCKED
    )
    UPDATE "AnnouncementPost" AS p
    SET status = 'SENDING', "updatedAt" = NOW()
    FROM picked
    WHERE p.id = picked.id
    RETURNING p.id
  `;
  if (claimed.length === 0) return [];
  return db.announcementPost.findMany({
    where: { id: { in: claimed.map((row) => row.id) } },
    include: {
      announcement: {
        select: {
          id: true,
          type: true,
          status: true,
          content: true,
          expiresAt: true,
          snapshot: true,
          discordMessageIds: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function publishPendingAnnouncementPosts(limit = 20) {
  const config = discordServerConfig();
  if (!config) return { processed: 0, sent: 0 };
  const posts = await claimPendingPosts(Math.max(1, Math.min(limit, 50)));
  let sent = 0;
  for (const post of posts) {
    if (post.announcement.status !== "ACTIVE") {
      await db.announcementPost.update({
        where: { id: post.id },
        data: {
          status: "DELETED",
          lastError: "Annonce déjà retirée.",
        },
      });
      continue;
    }
    try {
      const messageId = await sendDiscordChannelMessage(
        config,
        post.channelId,
        embedForAnnouncement(post.announcement),
      );
      const ids = [
        ...new Set(
          [...post.announcement.discordMessageIds, messageId].filter(Boolean),
        ),
      ];
      await db.$transaction([
        db.announcementPost.update({
          where: { id: post.id },
          data: {
            status: "SENT",
            discordMessageId: messageId,
            lastError: "",
          },
        }),
        db.announcement.update({
          where: { id: post.announcement.id },
          data: {
            channelId: post.channelId,
            discordMessageId: messageId,
            discordMessageIds: ids,
          },
        }),
      ]);
      sent += 1;
    } catch (error) {
      const apiError = error instanceof DiscordApiError ? error : null;
      const permanent = lostAccess(apiError);
      await db.announcementPost.update({
        where: { id: post.id },
        data: {
          status: permanent ? "FAILED" : "PENDING",
          lastError: (
            error instanceof Error ? error.message : "Erreur Discord"
          ).slice(0, 300),
        },
      });
      if (permanent) {
        await forgetServerConfig(
          post.guildId,
          `publish ${apiError?.status ?? "error"}`,
        );
      }
      console.error("[discord] announcement publish", {
        postId: post.id,
        channelId: post.channelId,
        guildId: post.guildId,
        status: apiError?.status ?? null,
        code: apiError?.code ?? null,
      });
    }
  }
  return { processed: posts.length, sent };
}

type AnnouncementWithPosts = {
  id: string;
  discordMessageIds: string[];
  posts: {
    id: string;
    channelId: string;
    guildId: string;
    discordMessageId: string;
    status: string;
  }[];
};

async function purgeAnnouncementDiscord(announcement: AnnouncementWithPosts) {
  const config = discordServerConfig();
  const targets = new Map<
    string,
    { channelId: string; messageId: string; postId: string | null; guildId: string }
  >();
  for (const post of announcement.posts) {
    if (!post.discordMessageId) continue;
    targets.set(`${post.channelId}:${post.discordMessageId}`, {
      channelId: post.channelId,
      messageId: post.discordMessageId,
      postId: post.id,
      guildId: post.guildId,
    });
  }
  for (const messageId of announcement.discordMessageIds) {
    const post = announcement.posts.find(
      (item) => item.discordMessageId === messageId,
    );
    if (!post) continue;
    targets.set(`${post.channelId}:${messageId}`, {
      channelId: post.channelId,
      messageId,
      postId: post.id,
      guildId: post.guildId,
    });
  }
  let deleted = 0;
  if (!config) {
    await db.announcement.update({
      where: { id: announcement.id },
      data: { discordMessageIds: [] },
    });
    return deleted;
  }
  for (const target of targets.values()) {
    try {
      await deleteDiscordChannelMessage(
        config,
        target.channelId,
        target.messageId,
      );
      if (target.postId) {
        await db.announcementPost.update({
          where: { id: target.postId },
          data: { status: "DELETED", lastError: "" },
        });
      }
      deleted += 1;
    } catch (error) {
      const apiError = error instanceof DiscordApiError ? error : null;
      const gone = apiError?.code === 10008;
      const accessLost = lostAccess(apiError);
      if (target.postId) {
        await db.announcementPost.update({
          where: { id: target.postId },
          data: {
            status: gone || accessLost ? "DELETED" : "FAILED",
            lastError: (
              error instanceof Error ? error.message : "Erreur Discord"
            ).slice(0, 300),
          },
        });
      }
      if (gone || accessLost) deleted += 1;
      if (accessLost && !gone) {
        await forgetServerConfig(
          target.guildId,
          `delete ${apiError?.status ?? "error"}`,
        );
      }
      if (!gone && !accessLost) {
        console.error("[discord] announcement delete", {
          postId: target.postId,
          status: apiError?.status ?? null,
          code: apiError?.code ?? null,
        });
      }
    }
  }
  await db.announcement.update({
    where: { id: announcement.id },
    data: { discordMessageIds: [] },
  });
  return deleted;
}

export async function withdrawAnnouncementSyndication(announcementId: string) {
  await db.$transaction([
    db.announcement.update({
      where: { id: announcementId },
      data: { status: "EXPIRED", expiresAt: new Date() },
    }),
    db.announcementPost.updateMany({
      where: {
        announcementId,
        status: { in: ["PENDING", "SENDING"] },
      },
      data: { status: "DELETED", lastError: "Retirée par l’auteur." },
    }),
  ]);
  const announcement = await db.announcement.findUnique({
    where: { id: announcementId },
    include: {
      posts: {
        where: {
          discordMessageId: { not: "" },
          status: { not: "DELETED" },
        },
      },
    },
  });
  if (!announcement) return { deleted: 0 };
  const deleted = await purgeAnnouncementDiscord(announcement);
  return { deleted };
}

export async function expireDueAnnouncements(limit = 25) {
  const now = new Date();
  const due = await db.announcement.findMany({
    where: { status: "ACTIVE", expiresAt: { lte: now } },
    include: {
      posts: {
        where: {
          discordMessageId: { not: "" },
          status: { not: "DELETED" },
        },
      },
    },
    orderBy: { expiresAt: "asc" },
    take: Math.max(1, Math.min(limit, 50)),
  });
  let expired = 0;
  let deleted = 0;
  for (const announcement of due) {
    await db.announcement.update({
      where: { id: announcement.id },
      data: { status: "EXPIRED" },
    });
    expired += 1;
    deleted += await purgeAnnouncementDiscord(announcement);
  }
  return { expired, deleted };
}
