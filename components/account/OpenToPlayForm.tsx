"use client";

import { useActionState } from "react";
import { updatePlayOpenFlags } from "@/lib/actions/account";
import { OpenToPlayCheckboxes } from "@/components/account/OpenToPlayCheckboxes";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import type { PlayerRole } from "@prisma/client";

export function OpenToPlayForm({
  openToPlay,
}: {
  openToPlay: PlayerRole[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updatePlayOpenFlags,
    emptyActionState,
  );

  return (
    <Panel>
      <form action={formAction} className="flex flex-col gap-4">
        <OpenToPlayCheckboxes selected={openToPlay} />
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
