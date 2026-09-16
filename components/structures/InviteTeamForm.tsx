"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  detachTeamFromStructure,
  inviteTeamToStructure,
} from "@/lib/actions/structures";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";

export function InviteTeamForm({ structureId }: { structureId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    inviteTeamToStructure,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="structureId" value={structureId} />
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Team ID
        <input
          name="teamId"
          required
          className="hud-input font-mono"
          placeholder="Coller le Team ID"
          autoComplete="off"
        />
        <FieldError
          id="invite-team-error"
          message={firstFieldError(state.fieldErrors, "teamId")}
        />
      </label>
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
        idleLabel="Inviter l'équipe"
        pendingLabel="Envoi…"
      />
    </form>
  );
}

export function DetachTeamButton({
  structureId,
  teamId,
}: {
  structureId: string;
  teamId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    detachTeamFromStructure,
    emptyActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="structureId" value={structureId} />
      <input type="hidden" name="teamId" value={teamId} />
      <SubmitButton
        pending={pending}
        idleLabel="Détacher"
        pendingLabel="Détachement…"
      />
      {state.message && !state.ok ? (
        <p role="alert" className="mt-2 text-sm text-orange-400">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
