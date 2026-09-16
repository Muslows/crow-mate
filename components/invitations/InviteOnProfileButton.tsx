"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createInvitation } from "@/lib/actions/invitations";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function InviteOnProfileButton({
  playerId,
  battleTag,
  teams,
  pendingTeamIds = [],
  kind = "PLAYER",
}: {
  playerId: string;
  battleTag: string;
  teams: { id: string; name: string }[];
  pendingTeamIds?: string[];
  kind?: "PLAYER" | "COACH";
}) {
  const available = teams.filter((team) => !pendingTeamIds.includes(team.id));
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState(available[0]?.id ?? teams[0]?.id ?? "");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createInvitation,
    emptyActionState,
  );

  const selected = teams.find((team) => team.id === teamId);
  const sent = state.ok || (available.length === 0 && teams.length > 0);

  if (teams.length === 0) {
    return (
      <Link href="/manage/teams/new" className="hud-btn">
        Créer une équipe pour inviter
      </Link>
    );
  }

  if (sent) {
    return (
      <button type="button" disabled className="hud-btn opacity-50">
        Invitation envoyée
      </button>
    );
  }

  return (
    <>
      <button type="button" className="hud-btn" onClick={() => setOpen(true)}>
        {kind === "COACH" ? "Inviter comme coach" : "Inviter dans l'équipe"}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md border border-cyan-400/40 bg-[#070b12] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide">
              Inviter dans l&apos;équipe
            </h2>
            {available.length > 1 ? (
              <label className="mt-4 flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
                Équipe
                <select
                  className="hud-input"
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                >
                  {available.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <p className="mt-4 text-sm text-zinc-300">
              Inviter{" "}
              <span className="font-mono text-cyan-200">{battleTag}</span>{" "}
              {kind === "COACH" ? "comme coach de" : "dans"}{" "}
              <span className="uppercase text-orange-300">
                {selected?.name ?? available[0]?.name}
              </span>
              .
            </p>
            {state.message && !state.ok ? (
              <p role="alert" className="mt-3 text-sm text-orange-400">
                {state.message}
              </p>
            ) : null}
            <form action={formAction} className="mt-5 flex gap-3">
              <input type="hidden" name="playerId" value={playerId} />
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="teamId" value={teamId} />
              <button
                type="button"
                className="hud-btn-ghost"
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
              <SubmitButton
                pending={pending}
                idleLabel="Confirmer"
                pendingLabel="Envoi…"
              />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
