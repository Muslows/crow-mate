import { db } from "@/lib/db";
import { ensureAppSchema } from "@/lib/schema-ensure";

const announcementInclude = {
  team: {
    select: {
      id: true,
      name: true,
      estimatedSr: true,
      org: { select: { tag: true, name: true } },
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      discord: true,
      discordId: true,
      discordUsername: true,
    },
  },
} as const;

export async function getActiveAnnouncementsByType(
  type: "SCRIM" | "LFT" | "LFP",
) {
  await ensureAppSchema(db);
  return db.announcement.findMany({
    where: {
      type,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: announcementInclude,
    orderBy: { expiresAt: "asc" },
    take: 40,
  });
}

export async function getActiveLfsAnnouncements() {
  return db.announcement.findMany({
    where: {
      type: "SCRIM",
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: announcementInclude,
    orderBy: { expiresAt: "asc" },
    take: 40,
  });
}

export async function getActiveLfpAnnouncements() {
  return db.announcement.findMany({
    where: {
      type: "LFP",
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: announcementInclude,
    orderBy: { expiresAt: "asc" },
    take: 40,
  });
}

export async function getActiveAnnouncementsForTeam(teamId: string) {
  return db.announcement.findMany({
    where: {
      teamId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: announcementInclude,
    orderBy: { expiresAt: "asc" },
    take: 40,
  });
}

export async function getActiveLftForUser(userId: string) {
  await ensureAppSchema(db);
  return db.announcement.findFirst({
    where: {
      createdById: userId,
      type: "LFT",
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: announcementInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function listDiscordServerConfigs() {
  return db.discordServerConfig.findMany({
    orderBy: { updatedAt: "desc" },
  });
}
