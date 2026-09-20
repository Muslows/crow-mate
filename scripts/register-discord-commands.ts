import { registerSlashCommands } from "@/lib/discord/bot/register";
import { discordServerConfig } from "@/lib/discord/config";

async function main() {
  const config = discordServerConfig();
  if (!config) {
    console.error("Secrets Discord manquants.");
    process.exit(1);
  }

  await registerSlashCommands(config);
  console.info("Commandes slash enregistrées.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
