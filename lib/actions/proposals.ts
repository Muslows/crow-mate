"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canProposeTeamScrim, loadTeamAccessContext } from "@/lib/access";
import { applyOfficialMatchSlot } from "@/lib/data/availability";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  encodeMatchSlot,
  formatMatchSlot,
  isMatchableSlot,
} from "@/lib/scrim-slots";
import { requireAuthSession } from "@/lib/session";
import {
  scrimProposalCreateSchema,
  scrimProposalRespondSchema,
} from "@/lib/validations/proposal";
import { utcDateToIso, WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

function fail(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export async function proposeScrim(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = scrimProposalCreateSchema.safeParse({
    fromTeamId: formString(formData, "fromTeamId"),
    toTeamId: formString(formData, "toTeamId"),
    weekStartDate: formString(formData, "weekStartDate"),
    weekday: formString(formData, "weekday"),
    slot: formString(formData, "slot"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifie le créneau proposé.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (parsed.data.fromTeamId === parsed.data.toTeamId) {
    return fail("Tu ne peux pas te proposer un scrim à toi-même.");
  }

  const allowed = await canProposeTeamScrim(
    parsed.data.fromTeamId,
    session.user.id,
  );
  if (!allowed) {
    return fail("Tu n'as pas le droit de proposer un scrim pour cette équipe.");
  }

  const key = encodeMatchSlot(parsed.data.weekday, parsed.data.slot);
  const weekStart = new Date(`${parsed.data.weekStartDate}T00:00:00.000Z`);
  const [ours, theirs] = await Promise.all([
    db.officialSchedule.findUnique({
      where: {
        teamId_weekStartDate: {
          teamId: parsed.data.fromTeamId,
          weekStartDate: weekStart,
        },
      },
      select: { matchSlots: true },
    }),
    db.officialSchedule.findUnique({
      where: {
        teamId_weekStartDate: {
          teamId: parsed.data.toTeamId,
          weekStartDate: weekStart,
        },
      },
      select: { matchSlots: true },
    }),
  ]);
  if (!ours?.matchSlots.includes(key) || !theirs?.matchSlots.includes(key)) {
    return fail("Ce créneau n'est plus commun aux deux équipes.");
  }

  try {
    await db.scrimProposal.create({
      data: {
        fromTeamId: parsed.data.fromTeamId,
        toTeamId: parsed.data.toTeamId,
        weekStartDate: weekStart,
        weekday: parsed.data.weekday,
        slot: parsed.data.slot,
        createdById: session.user.id,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("Une proposition est déjà en attente sur ce créneau.");
    }
    throw error;
  }

  revalidateTeamViews(parsed.data.fromTeamId);
  revalidateTeamViews(parsed.data.toTeamId);
  return {
    ok: true,
    message: `Proposition envoyée pour ${formatMatchSlot(key)}.`,
    fieldErrors: {},
  };
}

export async function respondScrimProposal(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = scrimProposalRespondSchema.safeParse({
    proposalId: formString(formData, "proposalId"),
    decision: formString(formData, "decision"),
  });
  if (!parsed.success) {
    return fail("Proposition introuvable.");
  }

  const proposal = await db.scrimProposal.findUnique({
    where: { id: parsed.data.proposalId },
    include: {
      fromTeam: { select: { id: true, name: true } },
      toTeam: { select: { id: true, name: true } },
    },
  });
  if (!proposal || proposal.status !== "PENDING") {
    return fail("Cette proposition n'est plus en attente.");
  }

  const ctx = await loadTeamAccessContext(proposal.toTeamId, session.user.id);
  if (!ctx || !(ctx.admin || ctx.primaryManager)) {
    return fail("Seul le manager principal de l'équipe invitée peut répondre.");
  }

  if (parsed.data.decision === "refuse") {
    await db.scrimProposal.update({
      where: { id: proposal.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    revalidateTeamViews(proposal.fromTeamId);
    revalidateTeamViews(proposal.toTeamId);
    return {
      ok: true,
      message: "Proposition refusée.",
      fieldErrors: {},
    };
  }

  const weekday = WEEKDAY_KEYS.includes(proposal.weekday as WeekdayKey)
    ? (proposal.weekday as WeekdayKey)
    : null;
  const slot = proposal.slot;
  if (!weekday || !isMatchableSlot(slot)) {
    return fail("Créneau invalide.");
  }

  const weekStartIso = utcDateToIso(proposal.weekStartDate);
  await db.$transaction(async (tx) => {
    await applyOfficialMatchSlot(
      tx,
      proposal.fromTeamId,
      weekStartIso,
      weekday,
      slot,
    );
    await applyOfficialMatchSlot(
      tx,
      proposal.toTeamId,
      weekStartIso,
      weekday,
      slot,
    );
    await tx.scrimProposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
  });

  revalidateTeamViews(proposal.fromTeamId);
  revalidateTeamViews(proposal.toTeamId);
  return {
    ok: true,
    message: `Scrim accepté contre ${proposal.fromTeam.name}. Le créneau est inscrit au planning des deux équipes.`,
    fieldErrors: {},
  };
}
