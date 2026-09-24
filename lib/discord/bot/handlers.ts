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
} from "@/lib/discord/bot/command-names";

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
    title: "Crow-mate · Bot d’annonces",
    description:
      "On relais ici ce que les équipes publient sur Crow-mate, dans le salon que tu as choisi. Quand l’annonce expire, le message disparaît tout seul.",
    color: ANNOUNCEMENT_EMBED_COLOR,
    fields: [
      {
        name: "/setup-scrim-channel #salon",
        value: "Les recherches de scrim (**LFS**) atterrissent ici.",
      },
      {
        name: "/setup-player-channel #salon",
        value: "Les recherches de joueurs (**LFP**) atterrissent ici.",
      },
      {
        name: "/setup-team-channel #salon",
        value: "Les recherches d’équipes (**LFT**) atterrissent ici.",
      },
      {
        name: "/setup-ringer-channel #salon",
        value: "Les recherches de remplaçants atterrissent ici.",
      },
      {
        name: "/bot-info · /help",
        value: "Cette aide. Il te faut **Gérer le serveur** pour configurer les salons.",
      },
      {
        name: "Comment ça tourne",
        value:
          "1. Un manager publie sur Crow-mate.\n2. On poste **une fois** dans le bon salon.\n3. À l’expiration, le message est retiré — plus de fils morts.",
      },
    ],
    footer: { text: "Crow-mate — on garde les salons propres" },
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
          "Ces commandes se lancent depuis un serveur, pas en message privé.",
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
          "Il te faut **Gérer le serveur** (ou Administrateur) pour pointer les salons.",
      };
    }

    const channel = context.channel;
    if (!channel || !/^\d{17,19}$/.test(channel.id)) {
      return {
        ephemeral: true,
        content: "Choisis un salon textuel, on s’occupe du reste.",
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
      content: `C’est noté : **#${channel.name}** recevra les annonces **${setup.label}**. On poste une fois, puis on nettoie à l’expiration.`,
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
