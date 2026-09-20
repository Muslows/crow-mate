"use server";

import { db } from "@/lib/db";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { canWriteTeamPlanning } from "@/lib/access";
import { requireAuthSession } from "@/lib/session";
import { officialScheduleSchema } from "@/lib/validations/availability";
import { matchSlotsFromDays } from "@/lib/scrim-slots";
import { WEEKDAY_KEYS, allowedWeekStarts, isMondayIso } from "@/lib/week";

function scheduleError(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function saveOfficialSchedule(
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = officialScheduleSchema.safeParse({
    teamId: formString(formData, "teamId"),
    weekStartDate: formString(formData, "weekStartDate"),
    ...Object.fromEntries(
      WEEKDAY_KEYS.map((key) => [key, formData.get(key)]),
    ),
    ...Object.fromEntries(
      WEEKDAY_KEYS.map((key) => [`${key}Note`, formString(formData, `${key}Note`)]),
    ),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le planning validé.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  if (!isMondayIso(parsed.data.weekStartDate)) {
    return scheduleError("La semaine doit commencer un lundi.");
  }

  if (!allowedWeekStarts().includes(parsed.data.weekStartDate)) {
    return scheduleError(
      "Tu ne peux valider que la semaine en cours ou la suivante.",
    );
  }

  const allowed = await canWriteTeamPlanning(
    parsed.data.teamId,
    session.user.id,
  );
  if (!allowed) {
    return scheduleError(
      "Tu n'as pas le droit de modifier le planning officiel.",
    );
  }

  try {
    const { teamId, weekStartDate, ...days } = parsed.data;
    const weekStart = new Date(`${weekStartDate}T00:00:00.000Z`);
    const matchSlots = matchSlotsFromDays({
      monday: days.monday,
      tuesday: days.tuesday,
      wednesday: days.wednesday,
      thursday: days.thursday,
      friday: days.friday,
      saturday: days.saturday,
      sunday: days.sunday,
    });
    await db.officialSchedule.upsert({
      where: {
        teamId_weekStartDate: {
          teamId,
          weekStartDate: weekStart,
        },
      },
      create: {
        teamId,
        weekStartDate: weekStart,
        ...days,
        matchSlots,
      },
      update: { ...days, matchSlots },
    });
    return {
      ok: true,
      message: "Planning validé enregistré.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error("saveOfficialSchedule", error);
    return scheduleError("Impossible d'enregistrer le planning validé.");
  }
}
