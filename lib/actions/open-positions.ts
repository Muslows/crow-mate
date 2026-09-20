"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { canManageOpenPositions } from "@/lib/access";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { db } from "@/lib/db";
import { targetServersForAnnouncement } from "@/lib/discord/announce-dispatch";
import { discordContactLabel } from "@/lib/discord/announcements";
import { scheduleDiscordDispatch } from "@/lib/discord/schedule";
import { LFP_TTL_HOURS, formatLfpHeadline } from "@/lib/lfp";
import { requireAuthSession } from "@/lib/session";
import {
  addOpenPositionSchema,
  openPositionIdSchema,
  publishLfpSchema,
} from "@/lib/validations/open-position";

function fail(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function addOpenPosition(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = addOpenPositionSchema.safeParse({
    teamId: formString(formData, "teamId"),
    role: formString(formData, "role"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Choisis un rôle valide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (!(await canManageOpenPositions(parsed.data.teamId, session.user.id))) {
    return fail("Tu n’as pas le droit de gérer les postes de cette équipe.");
  }

  try {
    await db.openPosition.create({
      data: { teamId: parsed.data.teamId, role: parsed.data.role },
      select: { id: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("Ce rôle est déjà ouvert.");
    }
    throw error;
  }

  revalidateTeamViews(parsed.data.teamId);
  return { ok: true, message: "Poste ouvert.", fieldErrors: {} };
}

export async function removeOpenPosition(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = openPositionIdSchema.safeParse({
    positionId: formString(formData, "positionId"),
  });
  if (!parsed.success) {
    return fail("Poste introuvable.");
  }

  const position = await db.openPosition.findUnique({
    where: { id: parsed.data.positionId },
    select: { id: true, teamId: true },
  });
  if (!position) return fail("Poste introuvable.");
  if (!(await canManageOpenPositions(position.teamId, session.user.id))) {
    return fail("Tu n’as pas le droit de gérer les postes de cette équipe.");
  }

  await db.openPosition.delete({ where: { id: position.id } });
  revalidateTeamViews(position.teamId);
  return { ok: true, message: "Poste retiré.", fieldErrors: {} };
}

export async function publishLfpAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = publishLfpSchema.safeParse({
    positionId: formString(formData, "positionId"),
  });
  if (!parsed.success) return fail("Poste introuvable.");

  const position = await db.openPosition.findUnique({
    where: { id: parsed.data.positionId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          estimatedSr: true,
          platform: true,
          language: true,
          orgId: true,
        },
      },
    },
  });
  if (!position) return fail("Poste introuvable.");
  if (!(await canManageOpenPositions(position.teamId, session.user.id))) {
    return fail("Tu n’as pas le droit de publier un LFP pour cette équipe.");
  }

  const author = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      discord: true,
      discordId: true,
      discordUsername: true,
    },
  });
  if (!author) return fail("Compte introuvable.");

  const headline = formatLfpHeadline({
    platform: position.team.platform,
    estimatedSr: position.team.estimatedSr,
    role: position.role,
  });
  const expiresAt = new Date(Date.now() + LFP_TTL_HOURS * 60 * 60 * 1000);
  const contactDiscord = discordContactLabel(author);
  const snapshot: Prisma.InputJsonValue = {
    kind: "LFP",
    teamName: position.team.name,
    estimatedSr: position.team.estimatedSr,
    platform: position.team.platform,
    language: position.team.language,
    role: position.role,
    headline,
    contactName: author.name,
    contactDiscord,
    contactDiscordId: author.discordId ?? "",
  };

  const servers = await targetServersForAnnouncement("LFP");
  await db.announcement.create({
    data: {
      teamId: position.team.id,
      structureId: position.team.orgId,
      createdById: session.user.id,
      type: "LFP",
      content: headline,
      expiresAt,
      openPositionId: position.id,
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
  revalidateTeamViews(position.team.id);
  revalidatePath("/scrims");
  return {
    ok: true,
    message:
      servers.length > 0
        ? "LFP publié. Le bot le relayera sur les salons /setup-player-channel."
        : "LFP publié sur le site. Aucun salon LFP Discord n’est encore configuré (/setup-player-channel).",
    fieldErrors: {},
  };
}
