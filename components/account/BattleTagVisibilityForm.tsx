"use client";

import { useActionState } from "react";
import { updateBattleTagVisibility } from "@/lib/actions/account";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";

export function BattleTagVisibilityForm({
  battleTagPublic,
}: {
  battleTagPublic: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateBattleTagVisibility,
    emptyActionState,
  );

  return (
    <Panel>
      <form action={formAction} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Confidentialité
          </legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <input
              type="checkbox"
              name="battleTagPublic"
              value="on"
              defaultChecked={battleTagPublic}
              className="h-4 w-4 shrink-0 accent-orange-600 dark:accent-orange-400"
            />
            Rendre mon BattleTag public
          </label>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Désactivé : les autres voient ton pseudonyme. Activé : ton BattleTag
            apparaît sur ta fiche et ta carte de recherche.
          </p>
        </fieldset>
        {state.message ? (
          <p
            role="status"
            className={`text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}
          >
            {state.message}
          </p>
        ) : null}
        <SubmitButton
          pending={pending}
          idleLabel="Enregistrer"
          pendingLabel="Enregistrement…"
        />
      </form>
    </Panel>
  );
}
