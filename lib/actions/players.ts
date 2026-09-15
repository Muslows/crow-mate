"use server";

import { db } from "@/lib/db";
import { getOwnedTeam } from "@/lib/data/teams";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  emptyActionState,
  fieldErrorsFromZod,
  formString,
  formStringArray,
  type ActionState,
} from "@/lib/actions/state";
import { playerIdSchema, playerSchema } from "@/lib/validations/player";
import { teamIdSchema } from "@/lib/validations/team";
import { requireManagerSession, sessionRole } from "@/lib/session";
import { rankFromSr } from "@/lib/rank";

function parsePlayerForm(formData: FormData) {
  return playerSchema.safeParse({
    battleTag: formString(formData, "battleTag"),
    role: formString(formData, "role"),
    secondaryRole: formString(formData, "secondaryRole"),
    sr: formString(formData, "sr"),
    status: formString(formData, "status"),
    teamId: formString(formData, "teamId"),
    favoriteHeroes: formStringArray(formData, "heroes"),
    experience: formString(formData, "experience"),
  });
}

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

export async function createPlayer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parsePlayerForm(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs du joueur.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { team } = await ownedTeamOrForbidden(parsed.data.teamId);
  if (!team) return forbidden();

  await db.player.create({
    data: {
      ...parsed.data,
      rankDivision: rankFromSr(parsed.data.sr),
    },
  });
  revalidateTeamViews(parsed.data.teamId);
  return {
    ok: true,
    message: "Joueur ajouté au roster.",
    fieldErrors: {},
  };
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

  const parsed = parsePlayerForm(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs du joueur.",
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
    data: {
      battleTag: parsed.data.battleTag,
      role: parsed.data.role,
      secondaryRole: parsed.data.secondaryRole,
      sr: parsed.data.sr,
      rankDivision: rankFromSr(parsed.data.sr),
      status: parsed.data.status,
      favoriteHeroes: parsed.data.favoriteHeroes,
      experience: parsed.data.experience,
    },
  });

  revalidateTeamViews(team.id, player.id);
  return {
    ok: true,
    message: "Joueur mis à jour.",
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
