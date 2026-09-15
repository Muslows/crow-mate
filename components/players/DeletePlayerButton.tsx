"use client";

import { useActionState } from "react";
import { deletePlayer } from "@/lib/actions/players";
import { emptyActionState, type ActionState } from "@/lib/actions/state";

export function DeletePlayerButton({
  playerId,
  teamId,
}: {
  playerId: string;
  teamId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deletePlayer,
    emptyActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={playerId} />
      <input type="hidden" name="teamId" value={teamId} />
      <button type="submit" disabled={pending} className="hud-btn-ghost text-orange-300">
        {pending ? "Suppression…" : "Retirer"}
      </button>
      {state.message ? (
        <p role="alert" className="text-sm text-orange-400">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
