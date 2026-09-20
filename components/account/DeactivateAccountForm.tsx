"use client";

import { useActionState, useState } from "react";
import { deactivateAccount } from "@/lib/actions/account";
import { emptyActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Panel } from "@/components/ui/Panel";

export function DeactivateAccountForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    deactivateAccount,
    emptyActionState,
  );

  return (
    <Panel>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700 dark:text-red-400">
            Désactivation du compte
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ton compte sera immédiatement inaccessible. Tu disposeras de 30
            jours pour le réactiver avant anonymisation définitive.
          </p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hud-btn-ghost self-start border-red-300 text-red-700 dark:border-red-900 dark:text-red-300"
          >
            Désactiver mon compte
          </button>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <label className="form-label">
              Mot de passe actuel
              <input
                type="password"
                name="currentPassword"
                autoComplete="current-password"
                required
                className="hud-input"
              />
              {state.fieldErrors.currentPassword?.[0] ? (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {state.fieldErrors.currentPassword[0]}
                </span>
              ) : null}
            </label>
            <label className="form-label">
              Saisis SUPPRIMER pour confirmer
              <input
                type="text"
                name="confirmation"
                required
                autoComplete="off"
                className="hud-input"
              />
              {state.fieldErrors.confirmation?.[0] ? (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {state.fieldErrors.confirmation[0]}
                </span>
              ) : null}
            </label>
            {state.message ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {state.message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <SubmitButton
                pending={pending}
                idleLabel="Confirmer la désactivation"
                pendingLabel="Désactivation…"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="hud-btn-ghost"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </Panel>
  );
}
