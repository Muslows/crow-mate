"use server";

import { db } from "@/lib/db";
import { getOwnedTeam } from "@/lib/data/teams";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  emptyActionState,
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { playerIdSchema, rosterStatusSchema } from "@/lib/validations/player";
import { teamIdSchema } from "@/lib/validations/team";
import { requireManagerSession, sessionRole } from "@/lib/session";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Tu ne peux gérer que le roster de tes équipes.",
    fieldErrors: {},
  };
}

async function ownedTeamOrForbidden(teamId: string) {
  const session = await requireManagerSession();
  const team = await getOwnedTeam(teamId, session.user.id, sessionRole(session));
  if (!team) return { session, team: null as null };
  return { session, team };
}

export async function updatePlayer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idResult = playerIdSchema.safeParse(formString(formData, "id"));
  if (!idResult.success) {
    return {
      ok: false,
      message: "Joueur introuvable.",
      fieldErrors: {},
    };
  }

  const parsed = rosterStatusSchema.safeParse({
    status: formString(formData, "status"),
    teamId: formString(formData, "teamId"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le statut de roster.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { team } = await ownedTeamOrForbidden(parsed.data.teamId);
  if (!team) return forbidden();

  const player = await db.player.findUnique({
    where: { id: idResult.data },
    select: { id: true, teamId: true },
  });

  if (!player || player.teamId !== team.id) return forbidden();

  await db.player.update({
    where: { id: player.id },
    data: { status: parsed.data.status },
  });

  revalidateTeamViews(team.id, player.id);
  return {
    ok: true,
    message: "Statut de roster mis à jour.",
    fieldErrors: {},
  };
}

export async function deletePlayer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idResult = playerIdSchema.safeParse(formString(formData, "id"));
  const teamResult = teamIdSchema.safeParse(formString(formData, "teamId"));

  if (!idResult.success || !teamResult.success) {
    return {
      ok: false,
      message: "Joueur ou équipe introuvable.",
      fieldErrors: {},
    };
  }

  const { team } = await ownedTeamOrForbidden(teamResult.data);
  if (!team) return forbidden();

  const player = await db.player.findUnique({
    where: { id: idResult.data },
    select: { id: true, teamId: true },
  });

  if (!player || player.teamId !== team.id) return forbidden();

  await db.player.delete({ where: { id: player.id } });
  revalidateTeamViews(team.id, player.id);
  return emptyActionState;
}
