import { db } from "@/lib/db";

export async function getActiveLfsAnnouncements() {
  return db.announcement.findMany({
    where: {
      type: "SCRIM",
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: {
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
    },
    orderBy: { expiresAt: "asc" },
    take: 40,
  });
}

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

export async function listDiscordServerConfigs() {
  return db.discordServerConfig.findMany({
    orderBy: { updatedAt: "desc" },
  });
}
