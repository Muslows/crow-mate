"use client";

import { useActionState, useState } from "react";
import { updateScrimOpponent } from "@/lib/actions/scrims";
import { OpponentPicker, type OpponentOption } from "@/components/scrims/OpponentPicker";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";

export function ScrimOpponentEditor({
  scrimId,
  teamId,
  opponents,
  defaultTeamId,
  defaultName,
  defaultSr,
}: {
  scrimId: string;
  teamId: string;
  opponents: OpponentOption[];
  defaultTeamId?: string;
  defaultName: string;
  defaultSr?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateScrimOpponent,
    emptyActionState,
  );

  if (!open) {
    return (
      <button type="button" className="hud-btn-ghost" onClick={() => setOpen(true)}>
        Lier / modifier l&apos;adversaire
      </button>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3">
      <input type="hidden" name="scrimId" value={scrimId} />
      <input type="hidden" name="teamId" value={teamId} />
      <OpponentPicker
        teams={opponents}
        defaultTeamId={defaultTeamId}
        defaultName={defaultName}
        defaultSr={defaultSr}
      />
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
          {state.message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <SubmitButton
          pending={pending}
          idleLabel="Enregistrer"
          pendingLabel="Enregistrement…"
        />
        <button type="button" className="hud-btn-ghost" onClick={() => setOpen(false)}>
          Annuler
        </button>
      </div>
    </form>
  );
}
