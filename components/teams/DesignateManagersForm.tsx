"use client";

import { useActionState } from "react";
import { designateTeamManager } from "@/lib/actions/teams";
import { emptyActionState, firstFieldError, type ActionState } from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function DesignateManagersForm({
  teamId,
  seats,
}: {
  teamId: string;
  seats: { id: string; kind: string; user: { id: string; name: string } }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    designateTeamManager,
    emptyActionState,
  );

  return (
    <div className="flex flex-col gap-4">
      {seats.length > 0 ? (
        <ul className="flex flex-col gap-1 font-mono text-xs text-zinc-400">
          {seats.map((seat) => (
            <li key={seat.id}>
              {seat.user.name} ·{" "}
              {seat.kind === "PRIMARY" ? "Manager principal" : "Co-manager"}
            </li>
          ))}
        </ul>
      ) : null}
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="teamId" value={teamId} />
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
          ID utilisateur
          <input name="userId" required className="hud-input font-mono" />
          <FieldError
            id="designate-user-error"
            message={firstFieldError(state.fieldErrors, "userId")}
          />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs uppercase tracking-[0.16em] text-zinc-400">
            Désignation
          </legend>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="radio" name="mode" value="CO_MANAGER" defaultChecked />
            Co-manager (garde le manager actuel)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="radio" name="mode" value="TRANSFER" />
            Nouveau manager principal
          </label>
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
          idleLabel="Désigner"
          pendingLabel="Enregistrement…"
        />
      </form>
    </div>
  );
}
