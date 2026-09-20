"use client";

import { useActionState, useState } from "react";
import { ChatLaunchButton } from "@/components/chat/ChatLaunchButton";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { openValidatedScrimConversation } from "@/lib/actions/chat";
import { cancelValidatedScrim } from "@/lib/actions/proposals";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { SCRIM_CANCELLATION_REASONS } from "@/lib/constants";
import type { ScrimCancellationReason } from "@prisma/client";

export function ValidatedScrimActions({
  proposalId,
  viewerTeamId,
  opponentName,
  currentUserId,
}: {
  proposalId: string;
  viewerTeamId: string;
  opponentName: string;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] =
    useState<ScrimCancellationReason>("ROSTER_UNAVAILABLE");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    cancelValidatedScrim,
    emptyActionState,
  );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <ChatLaunchButton
          action={openValidatedScrimConversation}
          hiddenFields={{ proposalId, viewerTeamId }}
          idleLabel="Contacter le staff"
          peerName={`Staff · ${opponentName}`}
          currentUserId={currentUserId}
          kicker="Scrim"
          emptyHint="Aucun message. Coordonnez le staff adverse ici."
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hud-btn-ghost border-red-200 text-red-700 hover:border-red-400 dark:border-red-900 dark:text-red-300"
        >
          Annuler le Scrim
        </button>
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`cancel-scrim-${proposalId}`}
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="section-kicker">Action irréversible</p>
            <h2
              id={`cancel-scrim-${proposalId}`}
              className="mt-2 text-xl font-semibold"
            >
              Annuler le scrim contre {opponentName}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Le créneau sera retiré des deux plannings. Le manager adverse
              recevra immédiatement un message prioritaire.
            </p>
            <form action={formAction} className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="proposalId" value={proposalId} />
              <input type="hidden" name="viewerTeamId" value={viewerTeamId} />
              <label className="form-label">
                Motif obligatoire
                <select
                  name="reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value as ScrimCancellationReason)
                  }
                  className="hud-input"
                >
                  {SCRIM_CANCELLATION_REASONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                {reason === "OTHER"
                  ? "Précision obligatoire"
                  : "Précisions complémentaires"}
                <textarea
                  name="details"
                  required={reason === "OTHER"}
                  maxLength={500}
                  rows={4}
                  className="hud-input resize-none"
                  placeholder="Explique brièvement la situation au staff adverse…"
                />
                <FieldError
                  id={`cancel-details-${proposalId}`}
                  message={firstFieldError(state.fieldErrors, "details")}
                />
              </label>
              {state.message && !state.ok ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {state.message}
                </p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="hud-btn-ghost"
                >
                  Conserver le scrim
                </button>
                <SubmitButton
                  pending={pending}
                  idleLabel="Confirmer l’annulation"
                  pendingLabel="Annulation…"
                />
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
