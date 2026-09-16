"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { updatePlayer } from "@/lib/actions/players";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { ROSTER_STATUSES } from "@/lib/constants";
import type { RosterStatus } from "@prisma/client";

export function PlayerForm({
  teamId,
  player,
}: {
  teamId: string;
  player: { id: string; status: RosterStatus };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updatePlayer,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={player.id} />
      <input type="hidden" name="teamId" value={teamId} />
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Statut roster
        <select
          name="status"
          defaultValue={player.status}
          className="hud-input"
        >
          {ROSTER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <FieldError
          id="roster-status-error"
          message={firstFieldError(state.fieldErrors, "status")}
        />
      </label>
      <p className="text-xs text-zinc-500">
        BattleTag, SR, tier list et expérience restent à la main du joueur.
      </p>
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
        idleLabel="Mettre à jour le statut"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
