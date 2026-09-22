"use server";

import { revalidatePath } from "next/cache";
import { type ActionState } from "@/lib/actions/state";
import { DiscordApiError, sendDiscordDirectMessage } from "@/lib/discord/api";
import { discordServerConfig } from "@/lib/discord/config";
import { db } from "@/lib/db";
import { requireAuthSession } from "@/lib/session";
import { formString } from "@/lib/actions/state";
import { discordBotPreferencesSchema } from "@/lib/validations/discord";

function fail(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

function revalidateDiscordSettings() {
  revalidatePath("/profile/settings/notifications");
  revalidatePath("/profile/settings/discord-bot");
}

export async function updateDiscordBotPreferences(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = discordBotPreferencesSchema.safeParse({
    notifyDiscordMessages: formString(formData, "notifyDiscordMessages"),
    notifyDiscordInvitations: formString(formData, "notifyDiscordInvitations"),
    notifyDiscordScrims: formString(formData, "notifyDiscordScrims"),
    notifyDiscordCancellations: formString(
      formData,
      "notifyDiscordCancellations",
    ),
  });
  if (!parsed.success) {
    return fail("Préférences Discord invalides.");
  }
  await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });
  revalidateDiscordSettings();
  return {
    ok: true,
    message: "Tes préférences de notifications Discord sont enregistrées.",
    fieldErrors: {},
  };
}

export async function unlinkDiscordAccount(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _prev;
  void _formData;
  const session = await requireAuthSession();
  await db.user.update({
    where: { id: session.user.id },
    data: {
      discordId: null,
      discordUsername: "",
      discordDmBlocked: false,
    },
  });
  revalidateDiscordSettings();
  return {
    ok: true,
    message: "Ton compte Discord n’est plus associé.",
    fieldErrors: {},
  };
}

export async function testDiscordDirectMessage(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _prev;
  void _formData;
  const session = await requireAuthSession();
  const config = discordServerConfig();
  if (!config) return fail("L’intégration Discord n’est pas configurée.");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { discordId: true, name: true },
  });
  if (!user?.discordId) {
    return fail("Associe d’abord ton compte Discord.");
  }

  try {
    await sendDiscordDirectMessage(config, user.discordId, {
      title: "Crow-mate — Test",
      description: `Salut **${user.name}**. Tes alertes de scrim arriveront ici, en message privé.`,
      color: 0xea580c,
      footer: { text: "Crow-mate" },
    });
    await db.user.update({
      where: { id: session.user.id },
      data: { discordDmBlocked: false },
    });
  } catch (error) {
    const apiError = error instanceof DiscordApiError ? error : null;
    console.error("[discord] test DM", {
      status: apiError?.status ?? null,
      code: apiError?.code ?? null,
      message: error instanceof Error ? error.message : "unknown",
    });
    await db.user.update({
      where: { id: session.user.id },
      data: { discordDmBlocked: Boolean(apiError?.cannotDm) },
    });
    revalidateDiscordSettings();
    if (apiError?.noMutualGuild) {
      return fail(
        "Le bot ne peut pas t’écrire : vous n’avez aucun serveur Discord en commun. Clique d’abord sur « Rejoindre le Discord Officiel », autorise les MP des membres, puis réessaie.",
      );
    }
    return fail(
      apiError?.cannotDm
        ? "Discord refuse le MP. Sur le serveur officiel, autorise les messages privés des membres du serveur, puis réessaie."
        : "Discord est temporairement indisponible.",
    );
  }

  revalidateDiscordSettings();
  return {
    ok: true,
    message: "Message de test envoyé en MP Discord.",
    fieldErrors: {},
  };
}
