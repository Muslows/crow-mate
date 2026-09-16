"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  fieldErrorsFromZod,
  formString,
  formStringArray,
  type ActionState,
} from "@/lib/actions/state";
import { isBattleTagTaken } from "@/lib/battletag-availability";
import { playerProfileSchema } from "@/lib/validations/profile";
import { requirePlayerSession } from "@/lib/session";

export async function updatePlayerProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requirePlayerSession();
  const parsed = playerProfileSchema.safeParse({
    battleTag: formString(formData, "battleTag"),
    displayName: formString(formData, "displayName"),
    sr: formString(formData, "sr"),
    openToPlay: formStringArray(formData, "openToPlay"),
    favoriteHeroes: formStringArray(formData, "heroes"),
    languages: formStringArray(formData, "languages"),
    experience: formString(formData, "experience"),
    recruitmentStatus: formString(formData, "recruitmentStatus") || "LOOKING",
    battleTagPublic: formString(formData, "battleTagPublic"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie ton profil joueur.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    if (await isBattleTagTaken(parsed.data.battleTag, session.user.id)) {
      return {
        ok: false,
        message: "Vérifie ton profil joueur.",
        fieldErrors: { battleTag: ["Ce BattleTag est déjà utilisé"] },
      };
    }

    const { openToPlay, ...rest } = parsed.data;
    const payload = {
      ...rest,
      openToPlay,
      role: openToPlay[0] ?? "TANK",
    };
    const profile = await db.playerProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...payload,
      },
      update: payload,
    });

    revalidatePath("/profile");
    revalidatePath("/players");
    revalidatePath(`/players/${profile.id}`);
    return {
      ok: true,
      message: "Profil mis à jour.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error("updatePlayerProfile", error);
    return {
      ok: false,
      message: "Impossible d'enregistrer le profil pour le moment.",
      fieldErrors: {},
    };
  }
}
