"use server";

import { db } from "@/lib/db";
import {
  fieldErrorsFromZod,
  formString,
  formStringArray,
  type ActionState,
} from "@/lib/actions/state";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import { requirePlayerSession } from "@/lib/session";
import { WEEKDAY_SLOT_FIELDS, refreshTeamMatchWindows } from "@/lib/data/availability";
import { weeklyAvailabilitySchema } from "@/lib/validations/availability";
import { allowedWeekStarts, isMondayIso, WEEKDAY_KEYS } from "@/lib/week";

function availabilityError(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function saveWeeklyAvailability(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requirePlayerSession();
  const parsed = weeklyAvailabilitySchema.safeParse({
    weekStartDate: formString(formData, "weekStartDate"),
    ...Object.fromEntries(
      WEEKDAY_KEYS.map((key) => [
        WEEKDAY_SLOT_FIELDS[key],
        formStringArray(formData, WEEKDAY_SLOT_FIELDS[key]),
      ]),
    ),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie ton planning.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  if (!isMondayIso(parsed.data.weekStartDate)) {
    return availabilityError("La semaine doit commencer un lundi.");
  }

  const allowed = allowedWeekStarts();
  if (!allowed.includes(parsed.data.weekStartDate)) {
    return availabilityError(
      "Tu ne peux renseigner que la semaine en cours ou la suivante.",
    );
  }

  const profile = await db.playerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      sr: 0,
      role: "TANK",
      favoriteHeroes: [],
      experience: "",
      recruitmentStatus: "LOOKING",
    },
    update: {},
  });

  try {
    const { weekStartDate, ...days } = parsed.data;
    await db.weeklyAvailability.upsert({
      where: {
        playerId_weekStartDate: {
          playerId: profile.id,
          weekStartDate: new Date(`${weekStartDate}T00:00:00.000Z`),
        },
      },
      create: {
        playerId: profile.id,
        weekStartDate: new Date(`${weekStartDate}T00:00:00.000Z`),
        ...days,
      },
      update: days,
    });

    const roster = await db.player.findMany({
      where: { userId: session.user.id, teamId: { not: null } },
      select: { teamId: true },
    });
    const teamIds = [
      ...new Set(
        roster.flatMap((slot) => (slot.teamId ? [slot.teamId] : [])),
      ),
    ];
    for (const teamId of teamIds) {
      await refreshTeamMatchWindows(teamId, weekStartDate);
      revalidateTeamViews(teamId, profile.id);
    }
    if (teamIds.length === 0) {
      revalidateTeamViews(undefined, profile.id);
    }

    return {
      ok: true,
      message: "Planning enregistré.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error("saveWeeklyAvailability", error);
    return availabilityError("Impossible d'enregistrer le planning pour le moment.");
  }
}
