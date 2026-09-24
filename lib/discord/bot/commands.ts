import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import {
  BOT_HELP,
  BOT_INFO,
  SETUP_PLAYER_CHANNEL,
  SETUP_RINGER_CHANNEL,
  SETUP_SCRIM_CHANNEL,
  SETUP_TEAM_CHANNEL,
} from "@/lib/discord/bot/command-names";

export {
  BOT_HELP,
  BOT_INFO,
  SETUP_PLAYER_CHANNEL,
  SETUP_RINGER_CHANNEL,
  SETUP_SCRIM_CHANNEL,
  SETUP_TEAM_CHANNEL,
};

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
      "Où poster les recherches de scrim (LFS).",
      "Salon où tomberont les LFS",
    ),
    setupChannelCommand(
      SETUP_PLAYER_CHANNEL,
      "Où poster les recherches de joueurs (LFP).",
      "Salon où tomberont les LFP",
    ),
    setupChannelCommand(
      SETUP_TEAM_CHANNEL,
      "Où poster les recherches d’équipes (LFT).",
      "Salon où tomberont les LFT",
    ),
    setupChannelCommand(
      SETUP_RINGER_CHANNEL,
      "Où poster les recherches de remplaçants.",
      "Salon où tomberont les ringers",
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
