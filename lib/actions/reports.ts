"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { requireAuthSession } from "@/lib/session";
import { reportSchema } from "@/lib/validations/report";

export async function submitReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = reportSchema.safeParse({
    targetType: formString(formData, "targetType"),
    targetId: formString(formData, "targetId"),
    reason: formString(formData, "reason"),
    details: formString(formData, "details"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le signalement.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  if (parsed.data.targetType === "PLAYER") {
    const profile = await db.playerProfile.findUnique({
      where: { id: parsed.data.targetId },
      select: { userId: true },
    });
    const userId = profile?.userId ?? parsed.data.targetId;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return { ok: false, message: "Profil introuvable.", fieldErrors: {} };
    }
    if (user.id === session.user.id) {
      return { ok: false, message: "Tu ne peux pas te signaler.", fieldErrors: {} };
    }
    await db.report.create({
      data: {
        reporterId: session.user.id,
        targetType: "PLAYER",
        reason: parsed.data.reason,
        details: parsed.data.details,
        targetUserId: user.id,
      },
    });
  } else {
    const team = await db.team.findUnique({
      where: { id: parsed.data.targetId },
      select: { id: true, managerId: true },
    });
    if (!team) {
      return { ok: false, message: "Équipe introuvable.", fieldErrors: {} };
    }
    if (team.managerId === session.user.id) {
      return {
        ok: false,
        message: "Tu ne peux pas signaler ta propre équipe.",
        fieldErrors: {},
      };
    }
    await db.report.create({
      data: {
        reporterId: session.user.id,
        targetType: "TEAM",
        reason: parsed.data.reason,
        details: parsed.data.details,
        teamId: team.id,
      },
    });
  }

  revalidatePath("/admin");
  return { ok: true, message: "Signalement envoyé aux administrateurs.", fieldErrors: {} };
}
