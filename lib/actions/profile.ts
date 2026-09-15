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
    sr: formString(formData, "sr"),
    primaryRole: formString(formData, "primaryRole"),
    secondaryRole: formString(formData, "secondaryRole"),
    favoriteHeroes: formStringArray(formData, "heroes"),
    languages: formStringArray(formData, "languages"),
    experience: formString(formData, "experience"),
    recruitmentStatus: formString(formData, "recruitmentStatus") || "LOOKING",
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

    const profile = await db.playerProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...parsed.data,
      },
      update: parsed.data,
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
