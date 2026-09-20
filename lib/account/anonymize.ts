import { db } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function processAccountAnonymizations(limit = 10) {
  const admin = createSupabaseAdminClient();
  if (!admin) return { processed: 0 };
  const users = await db.user.findMany({
    where: {
      deactivatedAt: { not: null },
      anonymizeAfter: { lte: new Date() },
      anonymizedAt: null,
    },
    select: { id: true },
    orderBy: { anonymizeAfter: "asc" },
    take: Math.max(1, Math.min(limit, 25)),
  });

  let processed = 0;
  for (const user of users) {
    try {
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error && error.status !== 404) {
        console.error("[account] Supabase anonymization", user.id, error);
        continue;
      }
      const now = new Date();
      await db.$transaction([
        db.chatMessage.updateMany({
          where: { senderId: user.id },
          data: { body: "[Message supprimé]" },
        }),
        db.player.updateMany({
          where: { userId: user.id },
          data: {
            userId: null,
            battleTag: "Compte supprimé",
            experience: "",
            favoriteHeroes: [],
          },
        }),
        db.playerProfile.updateMany({
          where: { userId: user.id },
          data: {
            battleTag: "",
            displayName: "",
            experience: "",
            favoriteHeroes: [],
            languages: [],
            openToPlay: [],
            battleTagPublic: false,
            recruitmentStatus: "NOT_LOOKING",
          },
        }),
        db.casterProfile.deleteMany({ where: { userId: user.id } }),
        db.teamSeat.deleteMany({ where: { userId: user.id } }),
        db.teamCoach.deleteMany({ where: { userId: user.id } }),
        db.teamPermission.deleteMany({ where: { userId: user.id } }),
        db.structureStaff.deleteMany({ where: { userId: user.id } }),
        db.teamInvitation.deleteMany({
          where: { OR: [{ inviterId: user.id }, { inviteeId: user.id }] },
        }),
        db.session.deleteMany({ where: { userId: user.id } }),
        db.account.deleteMany({ where: { userId: user.id } }),
        db.teamDiscordIntegration.updateMany({
          where: { installedById: user.id },
          data: { installedById: null },
        }),
        db.user.update({
          where: { id: user.id },
          data: {
            name: "Compte supprimé",
            email: `deleted+${user.id}@invalid.local`,
            emailVerified: false,
            pendingEmail: null,
            discord: "",
            isDiscordPublic: false,
            discordId: null,
            discordUsername: "",
            discordDmBlocked: false,
            notifyDiscordMessages: false,
            notifyDiscordInvitations: false,
            notifyDiscordScrims: false,
            notifyDiscordCancellations: false,
            image: null,
            role: "PLAYER",
            isManager: false,
            isPlayer: false,
            isCoach: false,
            isCaster: false,
            isStaff: false,
            openToCast: "CLOSED",
            openToCoach: "CLOSED",
            anonymizedAt: now,
          },
        }),
      ]);
      processed += 1;
    } catch (error) {
      console.error("[account] anonymization", user.id, error);
    }
  }
  return { processed };
}
