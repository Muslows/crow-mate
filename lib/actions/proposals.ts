"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  canProposeTeamScrim,
  canRespondToScrimProposal,
} from "@/lib/access";
import {
  applyOfficialMatchSlot,
  clearOfficialMatchSlot,
} from "@/lib/data/availability";
import { revalidateTeamViews } from "@/lib/actions/revalidate";
import {
  fieldErrorsFromZod,
  formString,
  type ActionState,
} from "@/lib/actions/state";
import {
  commonMatchSlots,
  encodeMatchSlot,
  formatMatchSlot,
  formatMatchSlotPhrase,
  isMatchableSlot,
  parseMatchSlot,
} from "@/lib/scrim-slots";
import { requireAuthSession } from "@/lib/session";
import {
  scrimProposalCancelSchema,
  scrimProposalCreateSchema,
  scrimProposalRespondSchema,
} from "@/lib/validations/proposal";
import { utcDateToIso, WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";
import {
  labelFor,
  SCRIM_CANCELLATION_REASONS,
} from "@/lib/constants";
import { enqueueDiscordNotification } from "@/lib/discord/outbox";
import { scheduleDiscordDispatch } from "@/lib/discord/schedule";

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

  const parsedSlot = parseMatchSlot(
    parsed.data.slot.includes(":")
      ? parsed.data.slot
      : `${parsed.data.weekday}:${parsed.data.slot}`,
  );
  if (!parsedSlot) return fail("Créneau invalide.");
  const key = `${parsedSlot.weekday}:${parsedSlot.startMinutes}-${parsedSlot.endMinutes}`;
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
  if (
    commonMatchSlots([key], ours?.matchSlots ?? []).length === 0 ||
    commonMatchSlots([key], theirs?.matchSlots ?? []).length === 0
  ) {
    return fail("Ce créneau n'est plus commun aux deux équipes.");
  }

  let proposalNotificationEnqueued = false;
  try {
    await db.$transaction(async (tx) => {
      const proposal = await tx.scrimProposal.create({
        data: {
          fromTeamId: parsed.data.fromTeamId,
          toTeamId: parsed.data.toTeamId,
          weekStartDate: weekStart,
          weekday: parsedSlot.weekday,
          slot: parsedSlot.slot,
          createdById: session.user.id,
        },
        include: {
          fromTeam: { select: { name: true, estimatedSr: true } },
          toTeam: { select: { managerId: true } },
        },
      });
      proposalNotificationEnqueued = await enqueueDiscordNotification(tx, {
        userId: proposal.toTeam.managerId,
        teamId: proposal.toTeamId,
        type: "SCRIM_PROPOSAL",
        dedupeKey: `scrim-proposal:${proposal.id}`,
        payload: {
          kind: "SCRIM_PROPOSAL",
          fromTeamName: proposal.fromTeam.name,
          estimatedSr: proposal.fromTeam.estimatedSr,
            when: formatMatchSlotPhrase(key),
        },
      });
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
  if (proposalNotificationEnqueued) scheduleDiscordDispatch();

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

  if (!(await canRespondToScrimProposal(proposal.toTeamId, session.user.id))) {
    return fail("Tu n'as pas le droit de répondre pour cette équipe.");
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
  try {
    await db.$transaction(
      async (tx) => {
        const conflict = await tx.scrimProposal.count({
          where: {
            status: "ACCEPTED",
            weekStartDate: proposal.weekStartDate,
            weekday: proposal.weekday,
            slot,
            OR: [
              { fromTeamId: { in: [proposal.fromTeamId, proposal.toTeamId] } },
              { toTeamId: { in: [proposal.fromTeamId, proposal.toTeamId] } },
            ],
          },
        });
        if (conflict > 0) throw new Error("SCRIM_SLOT_ALREADY_BOOKED");

        const accepted = await tx.scrimProposal.updateMany({
          where: { id: proposal.id, status: "PENDING" },
          data: { status: "ACCEPTED", respondedAt: new Date() },
        });
        if (accepted.count !== 1) throw new Error("SCRIM_PROPOSAL_STALE");

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
        await tx.scrimProposal.updateMany({
          where: {
            id: { not: proposal.id },
            status: "PENDING",
            weekStartDate: proposal.weekStartDate,
            weekday: proposal.weekday,
            slot,
            OR: [
              { fromTeamId: { in: [proposal.fromTeamId, proposal.toTeamId] } },
              { toTeamId: { in: [proposal.fromTeamId, proposal.toTeamId] } },
            ],
          },
          data: { status: "REJECTED", respondedAt: new Date() },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "SCRIM_SLOT_ALREADY_BOOKED" ||
        error.message === "SCRIM_PROPOSAL_STALE")
    ) {
      return fail("Ce créneau vient d’être réservé par un autre scrim.");
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return fail(
        "Deux validations simultanées ont eu lieu. Recharge et réessaie.",
      );
    }
    throw error;
  }

  revalidateTeamViews(proposal.fromTeamId);
  revalidateTeamViews(proposal.toTeamId);
  return {
    ok: true,
    message: `Scrim accepté contre ${proposal.fromTeam.name}. Le créneau est inscrit au planning des deux équipes.`,
    fieldErrors: {},
  };
}

export async function cancelValidatedScrim(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuthSession();
  const parsed = scrimProposalCancelSchema.safeParse({
    proposalId: formString(formData, "proposalId"),
    viewerTeamId: formString(formData, "viewerTeamId"),
    reason: formString(formData, "reason"),
    details: formString(formData, "details"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Vérifie le motif de l’annulation.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const proposal = await db.scrimProposal.findUnique({
    where: { id: parsed.data.proposalId },
    include: {
      fromTeam: { select: { id: true, name: true, managerId: true } },
      toTeam: { select: { id: true, name: true, managerId: true } },
    },
  });
  if (!proposal || proposal.status !== "ACCEPTED") {
    return fail("Ce scrim n’est plus validé.");
  }
  if (
    proposal.fromTeamId !== parsed.data.viewerTeamId &&
    proposal.toTeamId !== parsed.data.viewerTeamId
  ) {
    return fail("Cette équipe ne participe pas à ce scrim.");
  }
  if (
    !(await canRespondToScrimProposal(
      parsed.data.viewerTeamId,
      session.user.id,
    ))
  ) {
    return fail("Tu n’as pas le droit d’annuler ce scrim.");
  }

  const weekday = WEEKDAY_KEYS.includes(proposal.weekday as WeekdayKey)
    ? (proposal.weekday as WeekdayKey)
    : null;
  const slot = proposal.slot;
  if (!weekday || !isMatchableSlot(slot)) {
    return fail("Le créneau associé au scrim est invalide.");
  }

  const cancellingTeam =
    proposal.fromTeamId === parsed.data.viewerTeamId
      ? proposal.fromTeam
      : proposal.toTeam;
  const opponent =
    proposal.fromTeamId === parsed.data.viewerTeamId
      ? proposal.toTeam
      : proposal.fromTeam;
  const reasonLabel = labelFor(
    SCRIM_CANCELLATION_REASONS,
    parsed.data.reason,
  );
  const notification = [
    "⚠️ ANNULATION DE SCRIM",
    `${cancellingTeam.name} a annulé le scrim.`,
    `Motif : ${reasonLabel}.`,
    parsed.data.details ? `Détails : ${parsed.data.details}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const weekStartIso = utcDateToIso(proposal.weekStartDate);

  let cancellationNotificationEnqueued = false;
  try {
    await db.$transaction(async (tx) => {
      const cancelled = await tx.scrimProposal.updateMany({
        where: { id: proposal.id, status: "ACCEPTED" },
        data: {
          status: "CANCELLED",
          cancellationReason: parsed.data.reason,
          cancellationDetails: parsed.data.details,
          cancelledAt: new Date(),
          cancelledById: session.user.id,
          cancelledByTeamId: cancellingTeam.id,
        },
      });
      if (cancelled.count !== 1) {
        throw new Error("SCRIM_ALREADY_CANCELLED");
      }

      for (const teamId of [proposal.fromTeamId, proposal.toTeamId]) {
        const otherMatchOnSlot = await tx.scrimProposal.count({
          where: {
            id: { not: proposal.id },
            status: "ACCEPTED",
            weekStartDate: proposal.weekStartDate,
            weekday: proposal.weekday,
            slot,
            OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
          },
        });
        if (otherMatchOnSlot === 0) {
          await clearOfficialMatchSlot(
            tx,
            teamId,
            weekStartIso,
            weekday,
            slot,
          );
        }
      }

      if (proposal.fromTeam.managerId !== proposal.toTeam.managerId) {
        const contextKey = `scrim:${proposal.id}`;
        const conversation = await tx.conversation.upsert({
          where: {
            recruiterId_candidateId_contextKey: {
              recruiterId: proposal.fromTeam.managerId,
              candidateId: proposal.toTeam.managerId,
              contextKey,
            },
          },
          create: {
            recruiterId: proposal.fromTeam.managerId,
            candidateId: proposal.toTeam.managerId,
            contextType: "SCRIM",
            contextKey,
            scrimProposalId: proposal.id,
          },
          update: {},
          select: { id: true },
        });
        await tx.chatMessage.create({
          data: {
            conversationId: conversation.id,
            senderId: session.user.id,
            body: notification,
          },
        });
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
      }

      cancellationNotificationEnqueued = await enqueueDiscordNotification(tx, {
        userId: opponent.managerId,
        teamId: opponent.id,
        type: "SCRIM_CANCELLED",
        dedupeKey: `scrim-cancelled:${proposal.id}`,
        payload: {
          kind: "SCRIM_CANCELLED",
          when: formatMatchSlotPhrase(encodeMatchSlot(weekday, slot)),
          cancelledByTeamName: cancellingTeam.name,
          reason: parsed.data.details
            ? `${reasonLabel} — ${parsed.data.details}`
            : reasonLabel,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SCRIM_ALREADY_CANCELLED"
    ) {
      return fail("Ce scrim vient déjà d’être annulé.");
    }
    throw error;
  }
  if (cancellationNotificationEnqueued) scheduleDiscordDispatch();

  revalidateTeamViews(proposal.fromTeamId);
  revalidateTeamViews(proposal.toTeamId);
  return {
    ok: true,
    message: "Le scrim est annulé et le staff adverse a été notifié.",
    fieldErrors: {},
  };
}
