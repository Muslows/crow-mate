import { db } from "@/lib/db";

export async function getDiscordAccountLink(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      discordId: true,
      discordUsername: true,
      discord: true,
      discordDmBlocked: true,
      notifyDiscordMessages: true,
      notifyDiscordInvitations: true,
      notifyDiscordScrims: true,
      notifyDiscordCancellations: true,
    },
  });
}
