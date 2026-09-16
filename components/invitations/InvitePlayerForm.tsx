"use client";

import { useActionState } from "react";
import { createInvitation } from "@/lib/actions/invitations";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function InvitePlayerForm({
  teams,
  defaultTeamId,
  defaultPlayerId,
}: {
  teams: { id: string; name: string }[];
  defaultTeamId?: string;
  defaultPlayerId?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createInvitation,
    emptyActionState,
  );

  if (teams.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        Crée une équipe avant d&apos;envoyer une invitation.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="kind" value="PLAYER" />
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Équipe
        <select
          name="teamId"
          defaultValue={defaultTeamId ?? teams[0]?.id}
          className="hud-input"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Player ID
        <input
          name="playerId"
          defaultValue={defaultPlayerId}
          required
          placeholder="ID affiché sur la fiche joueur"
          className="hud-input font-mono"
        />
        <FieldError
          id="player-id-error"
          message={firstFieldError(state.fieldErrors, "playerId")}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Message
        <textarea
          name="message"
          rows={3}
          placeholder="On cherche un DPS flex pour les scrims…"
          className="hud-input"
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
        idleLabel="Envoyer l'invitation"
        pendingLabel="Envoi…"
      />
    </form>
  );
}
