"use client";

import { useActionState } from "react";
import { createTeamTimeSlot, deleteTeamTimeSlot } from "@/lib/actions/time-slots";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";

export function TeamTimeSlotsForm({
  teamId,
  slots,
}: {
  teamId: string;
  slots: { id: string; label: string; startTime: string; endTime: string }[];
}) {
  const [createState, createAction, createPending] = useActionState<
    ActionState,
    FormData
  >(createTeamTimeSlot, emptyActionState);
  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionState,
    FormData
  >(deleteTeamTimeSlot, emptyActionState);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Ces créneaux s’affichent dans la grille de dispos des joueurs. Le
        matchmaking recoupe les mêmes fenêtres horaires entre deux équipes.
      </p>
      <ul className="flex flex-col gap-2">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2"
          >
            <span className="text-sm font-medium">{slot.label}</span>
            <form action={deleteAction}>
              <input type="hidden" name="teamId" value={teamId} />
              <input type="hidden" name="slotId" value={slot.id} />
              <button
                type="submit"
                disabled={deletePending}
                className="text-xs font-semibold uppercase tracking-wide text-orange-800 hover:underline dark:text-orange-300"
              >
                Retirer
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form action={createAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="teamId" value={teamId} />
        <label className="form-label">
          Début
          <input
            name="startTime"
            type="time"
            defaultValue="19:30"
            className="hud-input"
            required
          />
          <FieldError
            id="start-time-error"
            message={firstFieldError(createState.fieldErrors, "startTime")}
          />
        </label>
        <label className="form-label">
          Fin
          <input
            name="endTime"
            type="time"
            defaultValue="21:30"
            className="hud-input"
            required
          />
          <FieldError
            id="end-time-error"
            message={firstFieldError(createState.fieldErrors, "endTime")}
          />
        </label>
        <div className="flex items-end">
          <SubmitButton
            pending={createPending}
            idleLabel="Ajouter"
            pendingLabel="Ajout…"
          />
        </div>
      </form>
      {createState.message ? (
        <p
          className={`text-sm ${createState.ok ? "text-emerald-700 dark:text-lime-400" : "text-orange-700 dark:text-orange-400"}`}
        >
          {createState.message}
        </p>
      ) : null}
      {deleteState.message && !deleteState.ok ? (
        <p className="text-sm text-orange-700 dark:text-orange-400">
          {deleteState.message}
        </p>
      ) : null}
    </div>
  );
}
