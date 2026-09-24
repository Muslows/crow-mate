"use server";

import { revalidatePath } from "next/cache";
import { canManageOpenPositions, canProposeTeamScrim } from "@/lib/access";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { db } from "@/lib/db";
import { ensureAppSchema } from "@/lib/schema-ensure";
import {
  targetServersForAnnouncement,
  withdrawAnnouncementSyndication,
} from "@/lib/discord/announce-dispatch";
import { discordContactLabel } from "@/lib/discord/announcements";
import { scheduleDiscordDispatch } from "@/lib/discord/schedule";
import {
  LFS_DURATION_HOURS,
  formatSrAsK,
  lfsHeadlineForSelection,
  type LfsPlatform,
  type LfsRegion,
  type LfsStartHour,
} from "@/lib/lfs";
import { requireAuthSession } from "@/lib/session";
import {
  announcementIdSchema,
  createLfsAnnouncementSchema,
  createLftAnnouncementSchema,
} from "@/lib/validations/announcement";
import type { Prisma } from "@prisma/client";
import {
  civilToIso,
  weekSnapshot,
  WEEKDAY_KEYS,
  type WeekdayKey,
} from "@/lib/week";
import { formatLftHeadline, LFT_TTL_HOURS } from "@/lib/lft";
import { WEEKDAY_SLOT_FIELDS } from "@/lib/availability";
import { publicDisplayName } from "@/lib/privacy-display";

function fail(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function createLfsAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  await ensureAppSchema(db);
  const parsed = createLfsAnnouncementSchema.safeParse({
    teamId: formString(formData, "teamId"),
    content: formString(formData, "content"),
    region: formString(formData, "region") || undefined,
    platform: formString(formData, "platform") || undefined,
    weekday: formString(formData, "weekday") || undefined,
    startHour: formString(formData, "startHour") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie l’annonce et le créneau.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (!(await canProposeTeamScrim(parsed.data.teamId, session.user.id))) {
    return fail("Tu n’as pas le droit de publier ce LFS.");
  }

  const [team, author] = await Promise.all([
    db.team.findUnique({
      where: { id: parsed.data.teamId },
      select: {
        id: true,
        name: true,
        estimatedSr: true,
        orgId: true,
      },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        discord: true,
        discordId: true,
        discordUsername: true,
      },
    }),
  ]);
  if (!team || !author) return fail("Équipe introuvable.");

  const generated = lfsHeadlineForSelection({
    region: parsed.data.region as LfsRegion,
    platform: parsed.data.platform as LfsPlatform,
    estimatedSr: team.estimatedSr,
    weekday: parsed.data.weekday as WeekdayKey,
    startHour: parsed.data.startHour as LfsStartHour,
  });
  if (generated.expiresAt.getTime() <= Date.now()) {
    return {
      ok: false,
      message: "Ce créneau est déjà terminé. Choisis un prochain slot.",
      fieldErrors: { expiresAt: ["Créneau invalide."] },
    };
  }
  if (
    generated.expiresAt.getTime() >
    Date.now() + 8 * 24 * 60 * 60 * 1000
  ) {
    return {
      ok: false,
      message: "Une annonce ne peut pas dépasser 8 jours.",
      fieldErrors: { expiresAt: ["8 jours max."] },
    };
  }

  const contactDiscord = discordContactLabel(author);
  const snapshot: Prisma.InputJsonValue = {
    teamName: team.name,
    estimatedSr: team.estimatedSr,
    srLabel: formatSrAsK(team.estimatedSr),
    region: parsed.data.region,
    platform: parsed.data.platform,
    weekday: parsed.data.weekday,
    startHour: parsed.data.startHour,
    endHour: generated.endHour,
    timeZoneName: generated.timeZoneName,
    headline: generated.headline,
    durationHours: LFS_DURATION_HOURS,
    contactName: author.name,
    contactDiscord,
    contactDiscordId: author.discordId ?? "",
  };

  const servers = await targetServersForAnnouncement("SCRIM");
  await db.announcement.create({
    data: {
      teamId: team.id,
      structureId: team.orgId,
      createdById: session.user.id,
      type: "SCRIM",
      content: parsed.data.content,
      expiresAt: generated.expiresAt,
      channelId: servers[0]?.channelId ?? "",
      snapshot,
      posts: {
        create: servers.map((server) => ({
          guildId: server.guildId,
          channelId: server.channelId,
        })),
      },
    },
    select: { id: true },
  });
  scheduleDiscordDispatch();
  revalidateTeamViews(team.id);
  revalidatePath("/scrims");
  revalidatePath("/annonces");
  return {
    ok: true,
    message:
      servers.length > 0
        ? "LFS publié. Le bot le relayera une seule fois sur les salons /setup-scrim-channel."
        : "LFS publié sur le site. Aucun salon Discord n’est encore configuré (commande /setup-scrim-channel).",
    fieldErrors: {},
  };
}

export async function createLftAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  await ensureAppSchema(db);
  const parsed = createLftAnnouncementSchema.safeParse({
    description: formString(formData, "description"),
    region: formString(formData, "region") || undefined,
    platform: formString(formData, "platform") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie la description et le format LFT.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const profile = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          name: true,
          discord: true,
          discordId: true,
          discordUsername: true,
        },
      },
    },
  });
  if (!profile) {
    return fail("Active d’abord ton profil joueur.");
  }

  const existing = await db.announcement.findFirst({
    where: {
      createdById: session.user.id,
      type: "LFT",
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
  if (existing) {
    return fail("Tu as déjà une annonce LFT active. Retire-la avant d’en publier une autre.");
  }

  const weekStart = civilToIso(weekSnapshot().currentStart);
  const availability = await db.weeklyAvailability.findUnique({
    where: {
      playerId_weekStartDate: {
        playerId: profile.id,
        weekStartDate: new Date(`${weekStart}T00:00:00.000Z`),
      },
    },
  });
  const weekdays = WEEKDAY_KEYS.filter((day) => {
    const field = WEEKDAY_SLOT_FIELDS[day];
    const slots = availability?.[field] ?? [];
    return slots.length > 0;
  });

  const headline = formatLftHeadline({
    region: parsed.data.region,
    platform: parsed.data.platform,
    estimatedSr: profile.sr,
    weekdays,
    startHour: 20,
    endHour: 22,
    role: profile.role,
  });
  const expiresAt = new Date(Date.now() + LFT_TTL_HOURS * 60 * 60 * 1000);
  const playerName = publicDisplayName({
    displayName: profile.displayName,
    name: profile.user.name,
  });
  const contactDiscord = discordContactLabel(profile.user);
  const snapshot: Prisma.InputJsonValue = {
    kind: "LFT",
    playerName,
    estimatedSr: profile.sr,
    region: parsed.data.region,
    platform: parsed.data.platform,
    role: profile.role,
    weekdays,
    headline,
    contactName: playerName,
    contactDiscord,
    contactDiscordId: profile.user.discordId ?? "",
  };

  const servers = await targetServersForAnnouncement("LFT");
  await db.announcement.create({
    data: {
      teamId: null,
      createdById: session.user.id,
      type: "LFT",
      content: headline,
      description: parsed.data.description,
      expiresAt,
      channelId: servers[0]?.channelId ?? "",
      snapshot,
      posts: {
        create: servers.map((server) => ({
          guildId: server.guildId,
          channelId: server.channelId,
        })),
      },
    },
    select: { id: true },
  });
  scheduleDiscordDispatch();
  revalidatePath("/annonces");
  revalidatePath("/profile/lft");
  revalidatePath(`/players/${profile.id}`);
  return {
    ok: true,
    message:
      servers.length > 0
        ? "LFT publié. Le bot le relayera sur les salons /setup-team-channel."
        : "LFT publié sur le site. Aucun salon LFT Discord n’est encore configuré (/setup-team-channel).",
    fieldErrors: {},
  };
}

export async function deleteAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = announcementIdSchema.safeParse({
    announcementId: formString(formData, "announcementId"),
  });
  if (!parsed.success) return fail("Annonce introuvable.");

  const announcement = await db.announcement.findUnique({
    where: { id: parsed.data.announcementId },
    select: {
      id: true,
      teamId: true,
      type: true,
      status: true,
      createdById: true,
    },
  });
  if (!announcement || announcement.status !== "ACTIVE") {
    return fail("Cette annonce n’est plus active.");
  }

  const isAuthor = announcement.createdById === session.user.id;
  let canStaff = false;
  if (announcement.teamId) {
    canStaff =
      announcement.type === "LFP"
        ? await canManageOpenPositions(announcement.teamId, session.user.id)
        : await canProposeTeamScrim(announcement.teamId, session.user.id);
  }
  if (!isAuthor && !canStaff) {
    return fail("Tu n’as pas le droit de retirer cette annonce.");
  }

  await withdrawAnnouncementSyndication(announcement.id);
  revalidateTeamViews(announcement.teamId ?? undefined);
  revalidatePath("/profile/lft");
  revalidatePath("/scrims");
  revalidatePath("/annonces");
  return {
    ok: true,
    message: "Annonce retirée du site et des salons Discord.",
    fieldErrors: {},
  };
}
