"use client";

import { useActionState, useId, useState } from "react";
import { deleteTeam } from "@/lib/actions/teams";
import { emptyActionState, firstFieldError, type ActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function DeleteTeamButton({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [typedName, setTypedName] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteTeam,
    emptyActionState,
  );

  const nameMatches = typedName === teamName;

  function close() {
    setOpen(false);
    setStep(1);
    setTypedName("");
  }

  return (
    <>
      <button
        type="button"
        className="hud-btn-ghost border-orange-500/50 text-orange-300"
        onClick={() => setOpen(true)}
      >
        Supprimer
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogId}
            className="w-full max-w-md border border-orange-400/40 bg-[#070b12] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={dialogId} className="text-lg font-semibold uppercase tracking-wide">
              Suppression définitive
            </h2>
            {step === 1 ? (
              <div className="mt-4 flex flex-col gap-4">
                <p className="text-sm text-zinc-300">
                  Tu vas supprimer l&apos;équipe{" "}
                  <span className="font-mono text-orange-300">{teamName}</span> et
                  tout son roster. Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <button type="button" className="hud-btn-ghost" onClick={close}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="hud-btn"
                    onClick={() => setStep(2)}
                  >
                    Continuer
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction} className="mt-4 flex flex-col gap-4">
                <input type="hidden" name="id" value={teamId} />
                <p className="text-sm text-zinc-300">
                  Tape exactement le nom de l&apos;équipe pour confirmer.
                </p>
                <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
                  Nom de l&apos;équipe
                  <input
                    name="confirmName"
                    value={typedName}
                    onChange={(event) => setTypedName(event.target.value)}
                    className="hud-input font-mono"
                    autoComplete="off"
                  />
                </label>
                {state.message ? (
                  <p role="alert" className="text-sm text-orange-400">
                    {state.message}
                  </p>
                ) : null}
                <p className="text-sm text-orange-400">
                  {firstFieldError(state.fieldErrors, "confirmName")}
                </p>
                <div className="flex gap-3">
                  <button type="button" className="hud-btn-ghost" onClick={close}>
                    Annuler
                  </button>
                  <SubmitButton
                    pending={pending}
                    disabled={!nameMatches}
                    idleLabel="Supprimer définitivement"
                    pendingLabel="Suppression…"
                    className="hud-btn disabled:opacity-40"
                  />
                </div>
                {!nameMatches ? (
                  <p className="text-xs text-zinc-500">
                    Le bouton serveur refuse aussi un nom inexact.
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
