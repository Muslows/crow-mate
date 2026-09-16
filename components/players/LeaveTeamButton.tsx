"use client";

import { useActionState, useState } from "react";
import { leaveCurrentTeams } from "@/lib/actions/roster";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function LeaveTeamButton({ teamNames }: { teamNames: string[] }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    leaveCurrentTeams,
    emptyActionState,
  );

  const confirmToken = teamNames[0] ?? "QUITTER";
  const matches = typed === confirmToken;

  if (state.ok) {
    return (
      <p className="text-sm text-lime-400">{state.message}</p>
    );
  }

  return (
    <>
      <button
        type="button"
        className="hud-btn-ghost border-orange-500/50 text-orange-300"
        onClick={() => setOpen(true)}
      >
        Quitter l&apos;équipe
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
            className="w-full max-w-md border border-orange-400/40 bg-[#070b12] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide">
              Quitter l&apos;équipe
            </h2>
            <p className="mt-4 text-sm text-zinc-300">
              Cette action retire ta fiche du roster{" "}
              <span className="font-mono text-orange-300">
                {teamNames.join(", ")}
              </span>
              . Ton statut repassera à « Recherche d&apos;équipe ».
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Tape exactement{" "}
              <span className="font-mono text-cyan-200">{confirmToken}</span>{" "}
              pour confirmer.
            </p>
            <form action={formAction} className="mt-4 flex flex-col gap-3">
              <input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                className="hud-input font-mono"
                autoComplete="off"
              />
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
                  disabled={!matches}
                  idleLabel="Confirmer le départ"
                  pendingLabel="Départ…"
                  className="hud-btn disabled:opacity-40"
                />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
