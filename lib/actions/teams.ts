"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fallbackBattleTag } from "@/lib/battletag";
import { getOwnedTeam } from "@/lib/data/teams";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  createTeamSchema,
  designateTeamManagerSchema,
  teamIdSchema,
  teamSchema,
} from "@/lib/validations/team";
import {
  isAdminRole,
  requireAuthSession,
  requireManagerSession,
  sessionCapabilities,
  sessionRole,
} from "@/lib/session";
import { syncDanglingManagerRole } from "@/lib/manager-lifecycle";
import {
  requestClubAffiliation,
  requestStructureAffiliation,
} from "@/lib/actions/affiliation";
import { rankFromSr } from "@/lib/rank";
import { defaultRosterRole } from "@/lib/specialties";
import type { TeamLeadership } from "@prisma/client";

function forbidden(): ActionState {
  return {
    ok: false,
    message: "Tu ne peux gérer que tes propres équipes.",
    fieldErrors: {},
  };
}

async function grantOfficialManager(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { isManager: true },
  });
}

async function addCaptainRosterSlot(teamId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      playerProfile: true,
    },
  });
  if (!user) return;

  let profile = user.playerProfile;
  if (!profile) {
    profile = await db.playerProfile.create({
      data: {
        userId,
        sr: 0,
        role: "TANK",
        favoriteHeroes: [],
        experience: "",
      },
    });
  }

  const battleTag =
    profile.battleTag.trim() || fallbackBattleTag(user.name, userId);

  await db.player.upsert({
    where: { teamId_userId: { teamId, userId } },
    create: {
      teamId,
      userId,
      battleTag,
      role: defaultRosterRole(profile.openToPlay, profile.role),
      sr: profile.sr,
      rankDivision: rankFromSr(profile.sr),
      status: "STARTER",
      favoriteHeroes: profile.favoriteHeroes,
      experience: profile.experience,
    },
    update: {},
  });

  await db.user.update({
    where: { id: userId },
    data: { isPlayer: true },
  });
}

export async function createTeam(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = createTeamSchema.safeParse({
    name: formString(formData, "name"),
    structure: formString(formData, "structure"),
    platform: formString(formData, "platform"),
    language: formString(formData, "language"),
    estimatedSr: formString(formData, "estimatedSr"),
    affiliationMode: formString(formData, "affiliationMode") || "INDEPENDENT",
    affiliationId: formString(formData, "affiliationId"),
    leadership: formString(formData, "leadership"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs de l'équipe.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { affiliationMode, affiliationId, leadership, ...teamData } = parsed.data;

  if (affiliationMode !== "INDEPENDENT" && !affiliationId.trim()) {
    return {
      ok: false,
      message: "Saisis l'ID du club parent ou de la structure.",
      fieldErrors: {
        affiliationId: ["ID obligatoire pour une demande d'affiliation."],
      },
    };
  }

  const team = await db.team.create({
    data: {
      ...teamData,
      leadership,
      managerId: session.user.id,
      seats: {
        create: {
          userId: session.user.id,
          kind: "PRIMARY",
        },
      },
    },
  });

  await grantOfficialManager(session.user.id);

  if (leadership === "CAPTAIN") {
    await addCaptainRosterSlot(team.id, session.user.id);
  }

  if (affiliationMode === "CLUB") {
    const affiliation = await requestClubAffiliation(
      team.id,
      affiliationId.trim(),
      session.user.id,
    );
    if (!affiliation.ok) {
      revalidateTeamViews(team.id);
      return affiliation;
    }
  }

  if (affiliationMode === "STRUCTURE") {
    const affiliation = await requestStructureAffiliation(
      team.id,
      affiliationId.trim(),
      session.user.id,
    );
    if (!affiliation.ok) {
      revalidateTeamViews(team.id);
      return affiliation;
    }
  }

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
    estimatedSr: formString(formData, "estimatedSr"),
    affiliationMode: "INDEPENDENT",
    affiliationId: "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie les champs de l'équipe.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { affiliationMode: _mode, affiliationId: _id, ...teamData } = parsed.data;

  await db.team.update({
    where: { id: owned.id },
    data: teamData,
  });

  revalidateTeamViews(owned.id);
  return {
    ok: true,
    message: "Équipe mise à jour.",
    fieldErrors: {},
  };
}

export async function designateTeamManager(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = designateTeamManagerSchema.safeParse({
    teamId: formString(formData, "teamId"),
    userId: formString(formData, "userId"),
    mode: formString(formData, "mode"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie la désignation.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const team = await db.team.findUnique({
    where: { id: parsed.data.teamId },
    select: { id: true, managerId: true, leadership: true, name: true },
  });
  if (!team) {
    return { ok: false, message: "Équipe introuvable.", fieldErrors: {} };
  }

  const admin = isAdminRole(sessionCapabilities(session));
  if (!admin && team.managerId !== session.user.id) {
    return {
      ok: false,
      message: "Seul le manager actuel peut désigner un co-manager ou un successeur.",
      fieldErrors: {},
    };
  }

  if (parsed.data.userId === team.managerId && parsed.data.mode === "TRANSFER") {
    return {
      ok: false,
      message: "Cet utilisateur gère déjà l'équipe.",
      fieldErrors: {},
    };
  }

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, name: true },
  });
  if (!user) {
    return {
      ok: false,
      message: "Aucun compte pour cet ID.",
      fieldErrors: { userId: ["Utilisateur introuvable."] },
    };
  }

  const leadership = team.leadership as TeamLeadership;
  if (leadership === "MANAGER") {
    await db.player.deleteMany({
      where: { teamId: team.id, userId: user.id },
    });
  }

  if (parsed.data.mode === "CO_MANAGER") {
    await db.teamSeat.upsert({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
      create: { teamId: team.id, userId: user.id, kind: "CO_MANAGER" },
      update: { kind: "CO_MANAGER" },
    });
    await grantOfficialManager(user.id);
    revalidateTeamViews(team.id);
    return {
      ok: true,
      message: `${user.name} est co-manager de ${team.name}.`,
      fieldErrors: {},
    };
  }

  await db.$transaction([
    db.team.update({
      where: { id: team.id },
      data: { managerId: user.id },
    }),
    db.teamSeat.upsert({
      where: { teamId_userId: { teamId: team.id, userId: user.id } },
      create: { teamId: team.id, userId: user.id, kind: "PRIMARY" },
      update: { kind: "PRIMARY" },
    }),
    db.teamSeat.upsert({
      where: {
        teamId_userId: { teamId: team.id, userId: team.managerId },
      },
      create: {
        teamId: team.id,
        userId: team.managerId,
        kind: "CO_MANAGER",
      },
      update: { kind: "CO_MANAGER" },
    }),
    db.user.update({
      where: { id: user.id },
      data: { isManager: true },
    }),
  ]);

  if (leadership === "CAPTAIN") {
    await addCaptainRosterSlot(team.id, user.id);
  }

  revalidateTeamViews(team.id);
  return {
    ok: true,
    message: `${user.name} est le nouveau manager de ${team.name}.`,
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
  if (
    owned.managerId !== session.user.id &&
    !isAdminRole(sessionCapabilities(session))
  ) {
    return {
      ok: false,
      message: "Seul le manager principal peut supprimer l'équipe.",
      fieldErrors: {},
    };
  }

  const confirmName = formString(formData, "confirmName");
  if (confirmName !== owned.name) {
    return {
      ok: false,
      message: "Saisis le nom exact de l'équipe pour confirmer la suppression.",
      fieldErrors: { confirmName: ["Le nom ne correspond pas."] },
    };
  }

  await db.team.delete({ where: { id: owned.id } });
  await syncDanglingManagerRole(session.user.id, { preserveOnboarding: false });
  revalidateTeamViews(owned.id);
  redirect("/manage");
}
