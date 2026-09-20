import { REST, Routes } from "discord.js";
import { slashCommandsJson } from "@/lib/discord/bot/commands";
import type { DiscordOAuthConfig } from "@/lib/discord/config";

export async function registerSlashCommands(config: DiscordOAuthConfig) {
  const rest = new REST({ version: "10" }).setToken(config.botToken);
  await rest.put(Routes.applicationCommands(config.clientId), {
    body: slashCommandsJson(),
  });
}
