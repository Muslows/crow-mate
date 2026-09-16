"use server";

import { db } from "@/lib/db";
import { canRecordTeamScrim } from "@/lib/access";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  formStringArray,
  type ActionState,
} from "@/lib/actions/state";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";
import {
  scrimIdSchema,
  scrimOpponentSchema,
  scrimReportSchema,
} from "@/lib/validations/scrim";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Seul le manager ou le coach de l'équipe peut saisir un scrim.",
    fieldErrors: {},
  };
}

function parseOptionalSr(formData: FormData) {
  const value = formString(formData, "opponentSrInput");
  return value === "" ? undefined : value;
}

function parseMaps(formData: FormData) {
  const mapNames = formStringArray(formData, "mapName");
  const outcomes = formStringArray(formData, "outcome");
  const intensities = formStringArray(formData, "intensity");
  const length = Math.max(mapNames.length, outcomes.length, intensities.length);
  return Array.from({ length }, (_, index) => ({
    mapName: mapNames[index] ?? "",
    outcome: outcomes[index] ?? "",
    intensity: intensities[index] ?? "",
  }));
}

async function resolveOpponent(input: {
  teamId: string;
  opponentTeamId: string;
  opponentNameInput: string;
  opponentSrInput?: number;
}) {
  if (!input.opponentTeamId) {
    return {
      opponentTeamId: null,
      opponentNameInput: input.opponentNameInput,
      opponentSrInput: input.opponentSrInput ?? null,
    };
  }
  const opponent = await db.team.findUnique({
    where: { id: input.opponentTeamId },
    select: { id: true, name: true, org: { select: { tag: true } } },
  });
  if (!opponent || opponent.id === input.teamId) {
    return null;
  }
  return {
    opponentTeamId: opponent.id,
    opponentNameInput:
      input.opponentNameInput ||
      teamDisplayName(opponent.name, opponent.org?.tag),
    opponentSrInput: null,
  };
}

export async function createScrimReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = scrimReportSchema.safeParse({
    teamId: formString(formData, "teamId"),
    opponentTeamId: formString(formData, "opponentTeamId"),
    opponentNameInput: formString(formData, "opponentNameInput"),
    opponentSrInput: parseOptionalSr(formData),
    opponentBehavior: formString(formData, "opponentBehavior"),
    playedAt: formString(formData, "playedAt") || undefined,
    maps: parseMaps(formData),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le rapport de scrim.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const allowed = await canRecordTeamScrim(parsed.data.teamId, session.user.id);
  if (!allowed) return forbidden();

  const opponent = await resolveOpponent(parsed.data);
  if (!opponent) {
    return {
      ok: false,
      message: "Équipe adverse introuvable.",
      fieldErrors: { opponentTeamId: ["Équipe introuvable"] },
    };
  }

  const playedAt = parsed.data.playedAt
    ? new Date(`${parsed.data.playedAt}T12:00:00.000Z`)
    : new Date();

  await db.scrim.create({
    data: {
      teamId: parsed.data.teamId,
      opponentTeamId: opponent.opponentTeamId,
      opponentNameInput: opponent.opponentNameInput,
      opponentSrInput: opponent.opponentSrInput,
      opponentBehavior: parsed.data.opponentBehavior,
      playedAt,
      createdById: session.user.id,
      maps: {
        create: parsed.data.maps.map((map, index) => ({
          mapName: map.mapName,
          outcome: map.outcome,
          intensity: map.intensity,
          sortOrder: index,
        })),
      },
    },
  });

  revalidateTeamViews(parsed.data.teamId);
  if (opponent.opponentTeamId) revalidateTeamViews(opponent.opponentTeamId);
  return {
    ok: true,
    message: "Scrim enregistré.",
    fieldErrors: {},
  };
}

export async function updateScrimOpponent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = scrimOpponentSchema.safeParse({
    scrimId: formString(formData, "scrimId"),
    teamId: formString(formData, "teamId"),
    opponentTeamId: formString(formData, "opponentTeamId"),
    opponentNameInput: formString(formData, "opponentNameInput"),
    opponentSrInput: parseOptionalSr(formData),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie l'adversaire.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const allowed = await canRecordTeamScrim(parsed.data.teamId, session.user.id);
  if (!allowed) return forbidden();

  const scrim = await db.scrim.findUnique({
    where: { id: parsed.data.scrimId },
    select: { id: true, teamId: true, opponentTeamId: true },
  });
  if (!scrim || scrim.teamId !== parsed.data.teamId) {
    return { ok: false, message: "Scrim introuvable.", fieldErrors: {} };
  }

  const opponent = await resolveOpponent(parsed.data);
  if (!opponent) {
    return {
      ok: false,
      message: "Équipe adverse introuvable.",
      fieldErrors: { opponentTeamId: ["Équipe introuvable"] },
    };
  }

  await db.scrim.update({
    where: { id: scrim.id },
    data: {
      opponentTeamId: opponent.opponentTeamId,
      opponentNameInput: opponent.opponentNameInput,
      opponentSrInput: opponent.opponentSrInput,
    },
  });
  revalidateTeamViews(scrim.teamId);
  if (scrim.opponentTeamId) revalidateTeamViews(scrim.opponentTeamId);
  if (opponent.opponentTeamId) revalidateTeamViews(opponent.opponentTeamId);
  return { ok: true, message: "Adversaire mis à jour.", fieldErrors: {} };
}

export async function deleteScrimReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = scrimIdSchema.safeParse(formString(formData, "scrimId"));
  if (!parsed.success) {
    return { ok: false, message: "Scrim introuvable.", fieldErrors: {} };
  }

  const scrim = await db.scrim.findUnique({
    where: { id: parsed.data },
    select: { id: true, teamId: true, opponentTeamId: true },
  });
  if (!scrim) {
    return { ok: false, message: "Scrim introuvable.", fieldErrors: {} };
  }

  const allowed = await canRecordTeamScrim(scrim.teamId, session.user.id);
  if (!allowed) return forbidden();

  await db.scrim.delete({ where: { id: scrim.id } });
  revalidateTeamViews(scrim.teamId);
  if (scrim.opponentTeamId) revalidateTeamViews(scrim.opponentTeamId);
  return { ok: true, message: "Scrim supprimé.", fieldErrors: {} };
}
