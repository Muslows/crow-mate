import { ANNOUNCEMENT_EMBED_COLOR } from "@/lib/discord/announcements";
import type { DiscordEmbed } from "@/lib/discord/api";
import {
  isGuildTextChannel,
  persistGuildChannel,
  type DiscordAnnounceKind,
} from "@/lib/discord/server-config";
import {
  SETUP_PLAYER_CHANNEL,
  SETUP_RINGER_CHANNEL,
  SETUP_SCRIM_CHANNEL,
  SETUP_TEAM_CHANNEL,
} from "@/lib/discord/bot/commands";

const ADMINISTRATOR = BigInt("8");
const MANAGE_GUILD = BigInt("32");

const SETUP_COMMANDS: Record<
  string,
  { kind: DiscordAnnounceKind; label: string }
> = {
  [SETUP_SCRIM_CHANNEL]: { kind: "scrim", label: "LFS (recherche de scrim)" },
  [SETUP_PLAYER_CHANNEL]: { kind: "player", label: "LFP (recherche de joueur)" },
  [SETUP_TEAM_CHANNEL]: { kind: "team", label: "LFT (recherche d’équipe)" },
  [SETUP_RINGER_CHANNEL]: {
    kind: "ringer",
    label: "ringers / subs (remplaçants)",
  },
};

export type SlashChannelOption = {
  id: string;
  name: string;
  type: number;
};

export type SlashCommandContext = {
  commandName: string;
  guildId: string | null;
  guildName: string;
  memberPermissions: bigint;
  channel: SlashChannelOption | null;
};

export type SlashCommandReply = {
  ephemeral: boolean;
  content?: string;
  embeds?: DiscordEmbed[];
};

export function hasManageServer(permissions: bigint): boolean {
  return (
    (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
    (permissions & MANAGE_GUILD) === MANAGE_GUILD
  );
}

function helpEmbed(): DiscordEmbed {
  return {
    title: "OW Manager · Bot d’annonces",
    description:
      "Ce bot relais les annonces publiées sur OW Manager vers le salon que tu as choisi pour chaque flux, puis les efface à l’expiration.",
    color: ANNOUNCEMENT_EMBED_COLOR,
    fields: [
      {
        name: "/setup-scrim-channel #salon",
        value: "Salon des **LFS** (recherche de scrim).",
      },
      {
        name: "/setup-player-channel #salon",
        value: "Salon des **LFP** (recherche de joueur).",
      },
      {
        name: "/setup-team-channel #salon",
        value: "Salon des **LFT** (recherche d’équipe).",
      },
      {
        name: "/setup-ringer-channel #salon",
        value: "Salon des **ringers / subs** (remplaçants).",
      },
      {
        name: "/bot-info · /help",
        value: "Affiche cette aide. Permission : **Gérer le serveur**.",
      },
      {
        name: "Cycle de vie",
        value:
          "1. Un manager publie une annonce sur le site.\n2. Le bot la copie **une seule fois** dans le salon du flux.\n3. À l’expiration, l’annonce disparaît du site et le message Discord est **supprimé**.",
      },
    ],
    footer: { text: "OW Manager — annonces éphémères" },
  };
}

export async function handleSlashCommand(
  context: SlashCommandContext,
): Promise<SlashCommandReply> {
  try {
    if (!context.guildId) {
      return {
        ephemeral: true,
        content:
          "Ces commandes s’utilisent sur un serveur Discord, pas en message privé.",
      };
    }

    if (
      context.commandName === "bot-info" ||
      context.commandName === "help"
    ) {
      return { ephemeral: true, embeds: [helpEmbed()] };
    }

    const setup = SETUP_COMMANDS[context.commandName];
    if (!setup) {
      return { ephemeral: true, content: "Commande inconnue." };
    }

    if (!hasManageServer(context.memberPermissions)) {
      return {
        ephemeral: true,
        content:
          "Il te faut la permission **Gérer le serveur** (ou Administrateur) pour configurer ce bot.",
      };
    }

    const channel = context.channel;
    if (!channel || !/^\d{17,19}$/.test(channel.id)) {
      return {
        ephemeral: true,
        content: "Choisis un salon textuel valide.",
      };
    }
    if (!isGuildTextChannel(channel.type)) {
      return {
        ephemeral: true,
        content: "Le salon doit être un salon textuel (ou d’annonces).",
      };
    }

    await persistGuildChannel({
      guildId: context.guildId,
      guildName: context.guildName,
      channelId: channel.id,
      kind: setup.kind,
    });

    return {
      ephemeral: true,
      content: `Salon **${setup.label}** enregistré : **#${channel.name}**. Les prochaines annonces de ce flux seront publiées ici, une seule fois, puis supprimées à l’expiration.`,
    };
  } catch (error) {
    const prismaCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    console.error("[discord] slash command", {
      command: context.commandName,
      guildId: context.guildId,
      prismaCode: prismaCode || null,
      error: error instanceof Error ? error.message : error,
    });
    return {
      ephemeral: true,
      content:
        "Impossible d’enregistrer ce salon pour le moment. Réessaie dans un instant.",
    };
  }
}
