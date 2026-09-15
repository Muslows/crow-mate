"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOwnedTeam } from "@/lib/data/teams";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import { teamIdSchema, teamSchema } from "@/lib/validations/team";
import { requireManagerSession, sessionRole } from "@/lib/session";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Tu ne peux gérer que tes propres équipes.",
    fieldErrors: {},
  };
}

export async function createTeam(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireManagerSession();
  const parsed = teamSchema.safeParse({
    name: formString(formData, "name"),
    structure: formString(formData, "structure"),
    platform: formString(formData, "platform"),
    language: formString(formData, "language"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs de l'équipe.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const team = await db.team.create({
    data: {
      ...parsed.data,
      managerId: session.user.id,
    },
  });

  revalidateTeamViews(team.id);
  redirect(`/manage/teams/${team.id}/edit`);
}

export async function updateTeam(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireManagerSession();
  const idResult = teamIdSchema.safeParse(formString(formData, "id"));
  if (!idResult.success) {
    return {
      ok: false,
      message: "Équipe introuvable.",
      fieldErrors: {},
    };
  }

  const owned = await getOwnedTeam(
    idResult.data,
    session.user.id,
    sessionRole(session),
  );
  if (!owned) return forbidden();

  const parsed = teamSchema.safeParse({
    name: formString(formData, "name"),
    structure: formString(formData, "structure"),
    platform: formString(formData, "platform"),
    language: formString(formData, "language"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs de l'équipe.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  await db.team.update({
    where: { id: owned.id },
    data: parsed.data,
  });

  revalidateTeamViews(owned.id);
  return {
    ok: true,
    message: "Équipe mise à jour.",
    fieldErrors: {},
  };
}

export async function deleteTeam(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireManagerSession();
  const idResult = teamIdSchema.safeParse(formString(formData, "id"));
  if (!idResult.success) {
    return {
      ok: false,
      message: "Équipe introuvable.",
      fieldErrors: {},
    };
  }

  const owned = await getOwnedTeam(
    idResult.data,
    session.user.id,
    sessionRole(session),
  );
  if (!owned) return forbidden();

  const confirmName = formString(formData, "confirmName");
  if (confirmName !== owned.name) {
    return {
      ok: false,
      message: "Saisis le nom exact de l'équipe pour confirmer la suppression.",
      fieldErrors: { confirmName: ["Le nom ne correspond pas."] },
    };
  }

  await db.team.delete({ where: { id: owned.id } });
  revalidateTeamViews(owned.id);
  redirect("/manage");
}
