"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { requirePlayerSession } from "@/lib/session";

export async function leaveCurrentTeams(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const session = await requirePlayerSession();

  try {
    const slots = await db.player.findMany({
      where: {
        userId: session.user.id,
        team: { isNot: null },
      },
      select: { id: true, teamId: true },
    });

    if (slots.length === 0) {
      return {
        ok: false,
        message: "Tu n'es affilié à aucune équipe.",
        fieldErrors: {},
      };
    }

    const teamIds = [
      ...new Set(
        slots
          .map((slot) => slot.teamId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    await db.$transaction(async (tx) => {
      await tx.player.updateMany({
        where: {
          userId: session.user.id,
          team: { isNot: null },
        },
        data: { teamId: null },
      });

      await tx.playerProfile.update({
        where: { userId: session.user.id },
        data: { recruitmentStatus: "LOOKING" },
      });
    });

    const profile = await db.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    for (const teamId of teamIds) {
      revalidateTeamViews(teamId, profile?.id);
    }
    revalidatePath("/profile");
    if (profile) revalidatePath(`/players/${profile.id}`);

    return {
      ...emptyActionState,
      ok: true,
      message: "Tu as quitté l'équipe. Statut : recherche d'équipe.",
    };
  } catch (error) {
    console.error("leaveCurrentTeams", error);
    return {
      ok: false,
      message: "Impossible de quitter l'équipe pour le moment.",
      fieldErrors: {},
    };
  }
}
