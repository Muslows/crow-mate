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
  description?: string | null;
  expiresAt: Date;
  snapshot?: Prisma.JsonValue | null;
  type?: string;
}): DiscordEmbed {
  const snapshot = snapshotRecord(input.snapshot);
  const kind =
    input.type === "LFP" ||
    input.type === "PLAYER" ||
    snapshot?.kind === "LFP"
      ? "lfp"
      : input.type === "LFT" || input.type === "TEAM" || snapshot?.kind === "LFT"
        ? "lft"
        : "lfs";
  const teamName =
    typeof snapshot?.teamName === "string" ? snapshot.teamName : "";
  const playerName =
    typeof snapshot?.playerName === "string" ? snapshot.playerName : "";
  const contact =
    typeof snapshot?.contactDiscord === "string" ? snapshot.contactDiscord : "";
  const contactId =
    typeof snapshot?.contactDiscordId === "string"
      ? snapshot.contactDiscordId
      : "";
  const [headline = input.content, ...rest] = input.content.split("\n");
  const notes = [input.description?.trim() ?? "", rest.join("\n").trim()]
    .filter(Boolean)
    .join("\n");
  const mention =
    contactId && /^\d{17,19}$/.test(contactId) ? `<@${contactId}>` : contact;
  const description = [
    teamName ? `**${teamName}**` : "",
    playerName ? `**${playerName}**` : "",
    mention ? `Écrire à ${mention}` : "",
    notes,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4096);

  const fallback =
    kind === "lfp"
      ? "Une équipe cherche un joueur. Passe sur Crow-mate pour écrire au staff."
      : kind === "lft"
        ? "Un joueur cherche une équipe. Ouvre Crow-mate pour lui écrire."
        : "Une équipe cherche un scrim. Contacte-les sur Crow-mate si le créneau te va.";

  return {
    title: (headline || (kind === "lfp" ? "LFP" : kind === "lft" ? "LFT" : "LFS")).slice(0, 256),
    description: description || fallback,
    color: ANNOUNCEMENT_EMBED_COLOR,
    fields: [
      {
        name: "Disparaît",
        value: `<t:${Math.floor(input.expiresAt.getTime() / 1000)}:R>`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    author: {
      name:
        kind === "lfp"
          ? "Crow-mate · recrutement"
          : kind === "lft"
            ? "Crow-mate · LFT"
            : "Crow-mate · scrim",
    },
    footer: { text: "Crow-mate — l’annonce s’efface toute seule" },
  };
}
