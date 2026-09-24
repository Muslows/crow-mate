export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.VERCEL === "1") return;
  const [{ startLocalDiscordDispatcher }, { startDiscordSlashBot }] =
    await Promise.all([
      import("@/lib/discord/schedule"),
      import("@/lib/discord/bot/client"),
    ]);
  startLocalDiscordDispatcher();
  void startDiscordSlashBot();
}
