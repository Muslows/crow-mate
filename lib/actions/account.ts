"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuthSession } from "@/lib/session";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { casterProfileSchema } from "@/lib/validations/chat";
import { playOpenFlagsSchema, toggleOpenFlagSchema, battleTagVisibilitySchema } from "@/lib/validations/open-flag";

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
  revalidatePath("/players");
  return { ok: true, message: "Profil caster enregistré.", fieldErrors: {} };
}
