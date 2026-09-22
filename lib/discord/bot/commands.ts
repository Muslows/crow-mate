import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export const SETUP_SCRIM_CHANNEL = "setup-scrim-channel";
export const SETUP_PLAYER_CHANNEL = "setup-player-channel";
export const SETUP_TEAM_CHANNEL = "setup-team-channel";
export const SETUP_RINGER_CHANNEL = "setup-ringer-channel";
export const BOT_INFO = "bot-info";
export const BOT_HELP = "help";

function setupChannelCommand(
  name: string,
  description: string,
  salonDescription: string,
) {
  return new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName("salon")
        .setDescription(salonDescription)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true),
    );
}

export function slashCommandBuilders() {
  return [
    setupChannelCommand(
      SETUP_SCRIM_CHANNEL,
      "Assigne le salon des recherches de scrim (LFS).",
      "Salon textuel de recherche de scrims",
    ),
    setupChannelCommand(
      SETUP_PLAYER_CHANNEL,
      "Assigne le salon des recherches de joueurs (LFP).",
      "Salon textuel Looking For Player",
    ),
    setupChannelCommand(
      SETUP_TEAM_CHANNEL,
      "Assigne le salon des recherches d’équipes (LFT).",
      "Salon textuel Looking For Team",
    ),
    setupChannelCommand(
      SETUP_RINGER_CHANNEL,
      "Assigne le salon des recherches de remplaçants (ringers / subs).",
      "Salon textuel Looking For Ringers",
    ),
    new SlashCommandBuilder()
      .setName(BOT_INFO)
      .setDescription("Aide du bot Crow-mate : commandes, permissions, flux.")
      .setDMPermission(false),
    new SlashCommandBuilder()
      .setName(BOT_HELP)
      .setDescription("Liste les commandes du bot Crow-mate.")
      .setDMPermission(false),
  ];
}

export function slashCommandsJson() {
  return slashCommandBuilders().map((command) => command.toJSON());
}
