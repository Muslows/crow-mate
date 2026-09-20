import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { handleSlashCommand } from "@/lib/discord/bot/handlers";
import { registerSlashCommands } from "@/lib/discord/bot/register";
import { discordServerConfig } from "@/lib/discord/config";

let started = false;

function memberPermissions(interaction: {
  memberPermissions?: { bitfield?: bigint } | null;
  member?: unknown;
}): bigint {
  const bitfield = interaction.memberPermissions?.bitfield;
  if (typeof bitfield === "bigint") return bitfield;
  const member = interaction.member as { permissions?: string } | null;
  if (member && typeof member.permissions === "string") {
    try {
      return BigInt(member.permissions);
    } catch {
      return BigInt("0");
    }
  }
  return BigInt("0");
}

export async function startDiscordSlashBot() {
  if (started || process.env.VERCEL === "1") return;
  const config = discordServerConfig();
  if (!config) {
    console.warn("[discord] slash bot: secrets manquants");
    return;
  }
  started = true;

  try {
    await registerSlashCommands(config);
    console.info("[discord] slash commands registered");
  } catch (error) {
    console.error("[discord] slash register", error);
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      const channel = interaction.options.getChannel("salon", false);
      const reply = await handleSlashCommand({
        commandName: interaction.commandName,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name ?? "",
        memberPermissions: memberPermissions(interaction),
        channel:
          channel && "id" in channel
            ? {
                id: channel.id,
                name: "name" in channel ? String(channel.name ?? "") : "",
                type:
                  "type" in channel
                    ? Number(channel.type)
                    : ChannelType.GuildText,
              }
            : null,
      });
      await interaction.reply({
        content: reply.content,
        embeds: reply.embeds?.map((embed) => ({
          title: embed.title,
          description: embed.description,
          color: embed.color,
          fields: embed.fields,
          footer: embed.footer,
        })),
        flags: reply.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    } catch (error) {
      console.error("[discord] interaction", error);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "Erreur interne. Réessaie.",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "Erreur interne. Réessaie.",
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch (replyError) {
        console.error("[discord] interaction reply", replyError);
      }
    }
  });

  client.on(Events.Error, (error) => {
    console.error("[discord] gateway", error);
  });

  try {
    await client.login(config.botToken);
    console.info("[discord] slash bot connected");
  } catch (error) {
    started = false;
    console.error("[discord] slash bot login", error);
  }
}
