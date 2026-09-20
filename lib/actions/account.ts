"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, requireAuthSession } from "@/lib/session";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { casterProfileSchema } from "@/lib/validations/chat";
import { playOpenFlagsSchema, toggleOpenFlagSchema, battleTagVisibilitySchema } from "@/lib/validations/open-flag";
import {
  deactivateAccountSchema,
  discordSettingsSchema,
  emailChangeSchema,
  passwordChangeSchema,
} from "@/lib/validations/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicAppUrl } from "@/lib/supabase/config";
import { messageForAuthError } from "@/lib/auth-errors";
import { verifyPassword } from "better-auth/crypto";
import { isLocalAppRuntime } from "@/lib/email-verification";
import { cookies } from "next/headers";
import { DEV_SESSION_COOKIE } from "@/lib/dev-session";

async function ensurePlayerProfile(userId: string) {
  await db.playerProfile.upsert({
    where: { userId },
    create: {
      userId,
      sr: 0,
      role: "TANK",
      favoriteHeroes: [],
      experience: "",
    },
    update: {},
  });
}

export async function enablePlayerAccess() {
  const session = await requireAuthSession();
  await db.user.update({
    where: { id: session.user.id },
    data: { isPlayer: true },
  });
  await ensurePlayerProfile(session.user.id);
  revalidatePath("/profile");
  revalidatePath("/manage");
  redirect("/profile");
}

export async function toggleOpenFlag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = toggleOpenFlagSchema.safeParse({
    flag: formString(formData, "flag"),
    value: formString(formData, "value"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Statut d'ouverture invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  if (parsed.data.flag === "openToCast") {
    const open = parsed.data.value === "OPEN";
    await db.user.update({
      where: { id: session.user.id },
      data: { openToCast: parsed.data.value, isCaster: open },
    });
    if (open) {
      await db.casterProfile.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id },
        update: {},
      });
      await ensurePlayerProfile(session.user.id);
    }
  } else {
    await db.user.update({
      where: { id: session.user.id },
      data: { openToCoach: parsed.data.value },
    });
    await ensurePlayerProfile(session.user.id);
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/profile/settings/account");
  revalidatePath("/profile/settings/profile");
  revalidatePath("/profile/settings/roles");
  revalidatePath("/profile/settings/notifications");
  revalidatePath("/players");
  return {
    ok: true,
    message:
      parsed.data.flag === "openToCast"
        ? parsed.data.value === "OPEN"
          ? "Tu es référencé comme caster."
          : "Disponibilité caster désactivée."
        : parsed.data.value === "OPEN"
          ? "Tu es ouvert au coaching. Un manager devra t'inviter."
          : "Disponibilité coach désactivée.",
    fieldErrors: {},
  };
}

export async function updatePlayOpenFlags(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = playOpenFlagsSchema.safeParse({
    openToPlay: formData.getAll("openToPlay"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Statuts Open to Play invalides.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  await ensurePlayerProfile(session.user.id);
  await db.playerProfile.update({
    where: { userId: session.user.id },
    data: {
      openToPlay: parsed.data.openToPlay,
      role: parsed.data.openToPlay[0] ?? "TANK",
    },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/profile/settings/account");
  revalidatePath("/profile/settings/profile");
  revalidatePath("/profile/settings/roles");
  revalidatePath("/profile/settings/notifications");
  revalidatePath("/players");
  return {
    ok: true,
    message: "Disponibilités de rôle enregistrées.",
    fieldErrors: {},
  };
}

export async function updateBattleTagVisibility(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = battleTagVisibilitySchema.safeParse({
    battleTagPublic: formString(formData, "battleTagPublic"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Préférence de visibilité invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  await ensurePlayerProfile(session.user.id);
  await db.playerProfile.update({
    where: { userId: session.user.id },
    data: { battleTagPublic: parsed.data.battleTagPublic },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/profile/settings/account");
  revalidatePath("/profile/settings/profile");
  revalidatePath("/profile/settings/roles");
  revalidatePath("/profile/settings/notifications");
  revalidatePath("/players");
  return {
    ok: true,
    message: parsed.data.battleTagPublic
      ? "Ton BattleTag est désormais public."
      : "Ton BattleTag est masqué pour les autres.",
    fieldErrors: {},
  };
}

export async function updateCasterProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = casterProfileSchema.safeParse({
    streamUrl: formString(formData, "streamUrl"),
    vodUrl: formString(formData, "vodUrl"),
    eventsNote: formString(formData, "eventsNote"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les liens caster.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { openToCast: true },
  });
  if (user?.openToCast !== "OPEN") {
    return {
      ok: false,
      message: "Active d'abord Open to Cast pour publier tes liens.",
      fieldErrors: {},
    };
  }

  await db.casterProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/profile/settings/account");
  revalidatePath("/profile/settings/profile");
  revalidatePath("/profile/settings/roles");
  revalidatePath("/profile/settings/notifications");
  revalidatePath("/players");
  return { ok: true, message: "Profil caster enregistré.", fieldErrors: {} };
}

export async function updateDiscordSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = discordSettingsSchema.safeParse({
    discord: formString(formData, "discord"),
    discordPublic: formString(formData, "discordPublic"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie ton identifiant Discord.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      discord: parsed.data.discord,
      isDiscordPublic: parsed.data.discordPublic,
    },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/profile/settings/account");
  revalidatePath("/profile/settings/profile");
  revalidatePath("/profile/settings/roles");
  revalidatePath("/profile/settings/notifications");
  revalidatePath("/players");
  return {
    ok: true,
    message: parsed.data.discord
      ? "Tes paramètres Discord sont enregistrés."
      : "Ton identifiant Discord a été supprimé.",
    fieldErrors: {},
  };
}

export async function changeAccountEmail(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = emailChangeSchema.safeParse({
    email: formString(formData, "email"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie la nouvelle adresse email.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (parsed.data.email === session.user.email.toLowerCase()) {
    return {
      ok: false,
      message: "Cette adresse est déjà celle de ton compte.",
      fieldErrors: { email: ["Choisis une autre adresse email."] },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase n’est pas configuré.",
      fieldErrors: {},
    };
  }

  try {
    const { error } = await supabase.auth.updateUser(
      { email: parsed.data.email },
      {
        emailRedirectTo: `${publicAppUrl()}/auth/callback?next=${encodeURIComponent(
          "/auth/email-confirmed?next=/profile/settings",
        )}`,
      },
    );
    if (error) {
      return {
        ok: false,
        message: messageForAuthError(error, "Modification de l’email impossible."),
        fieldErrors: {},
      };
    }
    await db.user.update({
      where: { id: session.user.id },
      data: {
        pendingEmail: parsed.data.email,
        emailVerified: false,
      },
    });
  } catch (error) {
    console.error("[account] email change", error);
    return {
      ok: false,
      message: messageForAuthError(
        error as { message?: string; code?: string },
        "Modification de l’email impossible. Réessaie.",
      ),
      fieldErrors: {},
    };
  }

  revalidatePath("/profile/settings");
  revalidatePath("/profile/settings/account");
  revalidatePath("/profile/settings/profile");
  revalidatePath("/profile/settings/roles");
  revalidatePath("/profile/settings/notifications");
  return {
    ok: true,
    message:
      "Un lien de confirmation a été envoyé. Ton ancienne adresse reste active jusqu’à validation.",
    fieldErrors: {},
  };
}

export async function resendAccountVerification(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _prev;
  void _formData;
  const session = await requireAuthSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, pendingEmail: true, emailVerified: true },
  });
  if (!user || (user.emailVerified && !user.pendingEmail)) {
    return {
      ok: true,
      message: "Ton adresse email est déjà vérifiée.",
      fieldErrors: {},
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase n’est pas configuré.",
      fieldErrors: {},
    };
  }

  const email = user.pendingEmail ?? user.email;
  try {
    const { error } = await supabase.auth.resend({
      type: user.pendingEmail ? "email_change" : "signup",
      email,
      options: {
        emailRedirectTo: `${publicAppUrl()}/auth/callback?next=${encodeURIComponent(
          "/auth/email-confirmed?next=/profile/settings",
        )}`,
      },
    });
    if (error) {
      return {
        ok: false,
        message: messageForAuthError(error, "Renvoi impossible pour le moment."),
        fieldErrors: {},
      };
    }
  } catch (error) {
    console.error("[account] resend verification", error);
    return {
      ok: false,
      message: messageForAuthError(
        error as { message?: string; code?: string },
        "Renvoi impossible pour le moment.",
      ),
      fieldErrors: {},
    };
  }

  return {
    ok: true,
    message: "Un nouvel email de confirmation a été envoyé.",
    fieldErrors: {},
  };
}

export async function changeAccountPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formString(formData, "currentPassword"),
    password: formString(formData, "password"),
    confirm: formString(formData, "confirm"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Vérifie les mots de passe.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase n’est pas configuré.",
      fieldErrors: {},
    };
  }

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: parsed.data.currentPassword,
    });
    if (signInError) {
      return {
        ok: false,
        message: messageForAuthError(
          signInError,
          "Le mot de passe actuel est incorrect.",
        ),
        fieldErrors: { currentPassword: ["Mot de passe actuel incorrect."] },
      };
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (updateError) {
      return {
        ok: false,
        message: messageForAuthError(
          updateError,
          "Modification du mot de passe impossible.",
        ),
        fieldErrors: {},
      };
    }
  } catch (error) {
    console.error("[account] password change", error);
    return {
      ok: false,
      message: messageForAuthError(
        error as { message?: string; code?: string },
        "Modification du mot de passe impossible. Réessaie.",
      ),
      fieldErrors: {},
    };
  }

  return {
    ok: true,
    message: "Ton mot de passe a été modifié.",
    fieldErrors: {},
  };
}

export async function deactivateAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = deactivateAccountSchema.safeParse({
    currentPassword: formString(formData, "currentPassword"),
    confirmation: formString(formData, "confirmation"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Confirmation invalide.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const [managedTeam, ownedStructure] = await Promise.all([
    db.team.findFirst({
      where: { managerId: session.user.id },
      select: { name: true },
    }),
    db.structure.findFirst({
      where: { ownerId: session.user.id },
      select: { name: true },
    }),
  ]);
  if (managedTeam || ownedStructure) {
    return {
      ok: false,
      message: managedTeam
        ? `Transfère ou supprime d’abord l’équipe « ${managedTeam.name} ».`
        : `Transfère d’abord la structure « ${ownedStructure?.name ?? ""} ».`,
      fieldErrors: {},
    };
  }

  const supabase = await createSupabaseServerClient();
  let authenticated = false;
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: parsed.data.currentPassword,
    });
    authenticated = !error;
  }
  if (!authenticated && isLocalAppRuntime()) {
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential",
        password: { not: null },
      },
      select: { password: true },
    });
    authenticated = Boolean(
      account?.password &&
        (await verifyPassword({
          password: parsed.data.currentPassword,
          hash: account.password,
        })),
    );
  }
  if (!authenticated) {
    return {
      ok: false,
      message: "Le mot de passe actuel est incorrect.",
      fieldErrors: { currentPassword: ["Mot de passe actuel incorrect."] },
    };
  }

  const now = new Date();
  await db.user.update({
    where: { id: session.user.id },
    data: {
      deactivatedAt: now,
      anonymizeAfter: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  if (supabase) await supabase.auth.signOut();
  if (isLocalAppRuntime()) {
    (await cookies()).delete(DEV_SESSION_COOKIE);
  }
  redirect("/login?deactivated=1");
}

export async function reactivateAccount(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/reactivate");
  await db.user.update({
    where: { id: session.user.id },
    data: {
      deactivatedAt: null,
      anonymizeAfter: null,
    },
  });
  revalidatePath("/");
  redirect("/profile/settings/account?reactivated=1");
}
