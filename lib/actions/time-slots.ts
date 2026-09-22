"use server";

import { db } from "@/lib/db";
import { canWriteTeamPlanning } from "@/lib/access";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { refreshTeamMatchWindows } from "@/lib/data/availability";
import { requireAuthSession } from "@/lib/session";
import {
  formatSlotLabel,
  rangeFromClock,
} from "@/lib/time-slots";
import {
  teamTimeSlotIdSchema,
  teamTimeSlotSchema,
} from "@/lib/validations/availability";
import { allowedWeekStarts } from "@/lib/week";

function fail(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

async function refreshCurrentWeeks(teamId: string) {
  for (const week of allowedWeekStarts()) {
    await refreshTeamMatchWindows(teamId, week);
  }
  revalidateTeamViews(teamId);
}

export async function createTeamTimeSlot(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = teamTimeSlotSchema.safeParse({
    teamId: formString(formData, "teamId"),
    startTime: formString(formData, "startTime"),
    endTime: formString(formData, "endTime"),
    label: formString(formData, "label"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le créneau.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (!(await canWriteTeamPlanning(parsed.data.teamId, session.user.id))) {
    return fail("Tu n’as pas le droit de modifier les créneaux de cette équipe.");
  }
  const range = rangeFromClock(parsed.data.startTime, parsed.data.endTime);
  if (!range) return fail("Horaires invalides.");

  const count = await db.teamTimeSlot.count({
    where: { teamId: parsed.data.teamId },
  });
  if (count >= 8) return fail("Maximum 8 créneaux par équipe.");

  const startTime = parsed.data.startTime.padStart(5, "0");
  const endTime = parsed.data.endTime.padStart(5, "0");
  await db.teamTimeSlot.create({
    data: {
      teamId: parsed.data.teamId,
      startTime,
      endTime,
      label: parsed.data.label?.trim() || formatSlotLabel(startTime, endTime),
      sortOrder: count,
    },
  });
  await refreshCurrentWeeks(parsed.data.teamId);
  return { ok: true, message: "Créneau ajouté.", fieldErrors: {} };
}

export async function deleteTeamTimeSlot(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = teamTimeSlotIdSchema.safeParse({
    teamId: formString(formData, "teamId"),
    slotId: formString(formData, "slotId"),
  });
  if (!parsed.success) return fail("Créneau introuvable.");
  if (!(await canWriteTeamPlanning(parsed.data.teamId, session.user.id))) {
    return fail("Tu n’as pas le droit de modifier les créneaux de cette équipe.");
  }
  const slot = await db.teamTimeSlot.findFirst({
    where: { id: parsed.data.slotId, teamId: parsed.data.teamId },
    select: { id: true },
  });
  if (!slot) return fail("Créneau introuvable.");
  await db.teamTimeSlot.delete({ where: { id: slot.id } });
  await refreshCurrentWeeks(parsed.data.teamId);
  return { ok: true, message: "Créneau retiré.", fieldErrors: {} };
}
