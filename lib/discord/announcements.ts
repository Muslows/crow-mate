import type { Prisma } from "@prisma/client";
import type { DiscordEmbed } from "@/lib/discord/api";

export const ANNOUNCEMENT_EMBED_COLOR = 0xea580c;

export type AnnouncementSnapshot = {
  teamName: string;
  estimatedSr: number;
  region: string;
  platform: string;
  weekday: string;
  startHour: number;
  endHour: number;
  timeZoneName: string;
  headline: string;
  contactName: string;
  contactDiscord: string;
  contactDiscordId: string;
};

function snapshotRecord(
  snapshot: Prisma.JsonValue | null | undefined,
): Record<string, unknown> | null {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }
  return snapshot as Record<string, unknown>;
}

export function discordContactLabel(input: {
  discordUsername?: string | null;
  discord?: string | null;
  name?: string | null;
}): string {
  const username = input.discordUsername?.trim();
  if (username) return `@${username.replace(/^@/, "")}`;
  const handle = input.discord?.trim();
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;
  return input.name?.trim() || "Manager";
}

export function embedForAnnouncement(input: {
  content: string;
  expiresAt: Date;
  snapshot?: Prisma.JsonValue | null;
  type?: string;
}): DiscordEmbed {
  const snapshot = snapshotRecord(input.snapshot);
  const isLfp =
    input.type === "LFP" ||
    (typeof snapshot?.kind === "string" && snapshot.kind === "LFP");
  const teamName =
    typeof snapshot?.teamName === "string" ? snapshot.teamName : "";
  const contact =
    typeof snapshot?.contactDiscord === "string" ? snapshot.contactDiscord : "";
  const contactId =
    typeof snapshot?.contactDiscordId === "string"
      ? snapshot.contactDiscordId
      : "";
  const [headline = input.content, ...rest] = input.content.split("\n");
  const notes = rest.join("\n").trim();
  const mention =
    contactId && /^\d{17,19}$/.test(contactId) ? `<@${contactId}>` : contact;
  const description = [
    teamName ? `**${teamName}**` : "",
    mention ? `Contact : ${mention}` : "",
    notes,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4096);

  return {
    title: (headline || (isLfp ? "LFP" : "LFS")).slice(0, 256),
    description: description || (isLfp ? "Looking for player" : "Looking for scrim"),
    color: ANNOUNCEMENT_EMBED_COLOR,
    fields: [
      {
        name: "Expire",
        value: `<t:${Math.floor(input.expiresAt.getTime() / 1000)}:R>`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    author: { name: isLfp ? "Crow-mate · LFP" : "Crow-mate · LFS" },
    footer: { text: "Crow-mate — annonce périssable" },
  };
}
