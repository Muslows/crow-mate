"use client";

import { useActionState, useState } from "react";
import { submitReport } from "@/lib/actions/reports";
import { emptyActionState, firstFieldError, type ActionState } from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { REPORT_REASONS } from "@/lib/constants";

export function ReportButton({
  targetType,
  targetId,
  label,
}: {
  targetType: "PLAYER" | "TEAM";
  targetId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitReport,
    emptyActionState,
  );

  if (state.ok) {
    return (
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-zinc-500">
        Signalement envoyé
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-zinc-500 hover:text-orange-300"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md border border-cyan-400/40 bg-[#070b12] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide">
              Signaler
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Un administrateur examinera ce signalement. Pas de BattleTag dans
              les détails.
            </p>
            <form action={formAction} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="targetType" value={targetType} />
              <input type="hidden" name="targetId" value={targetId} />
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
                Motif
                <select name="reason" required className="hud-input" defaultValue="">
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="report-reason-error"
                  message={firstFieldError(state.fieldErrors, "reason")}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
                Détails (optionnel)
                <textarea name="details" rows={3} className="hud-input min-h-20" />
                <FieldError
                  id="report-details-error"
                  message={firstFieldError(state.fieldErrors, "details")}
                />
              </label>
              {state.message && !state.ok ? (
                <p role="alert" className="text-sm text-orange-400">
                  {state.message}
                </p>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="hud-btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </button>
                <SubmitButton
                  pending={pending}
                  idleLabel="Envoyer"
                  pendingLabel="Envoi…"
                />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
