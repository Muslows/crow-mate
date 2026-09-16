"use client";

import { useActionState } from "react";
import { deleteScrimReport } from "@/lib/actions/scrims";
import { emptyActionState, type ActionState } from "@/lib/actions/state";

export function DeleteScrimButton({ scrimId }: { scrimId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteScrimReport,
    emptyActionState,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="scrimId" value={scrimId} />
      <button type="submit" className="hud-btn-ghost" disabled={pending}>
        {pending ? "Suppression…" : "Supprimer"}
      </button>
      {state.message && !state.ok ? (
        <p className="mt-1 text-xs text-orange-400">{state.message}</p>
      ) : null}
    </form>
  );
}
