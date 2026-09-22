"use client";

import { useActionState, useState } from "react";
import { proposeScrim } from "@/lib/actions/proposals";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { formatMatchSlot, parseMatchSlot } from "@/lib/scrim-slots";
import type { MatchSlotKey } from "@/lib/scrim-slots";
import { teamDisplayName } from "@/lib/team-name";

export function ProposeScrimButton({
  fromTeamId,
  toTeamId,
  toName,
  orgTag,
  weekStartDate,
  commonSlots,
}: {
  fromTeamId: string;
  toTeamId: string;
  toName: string;
  orgTag: string | null;
  weekStartDate: string;
  commonSlots: MatchSlotKey[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(commonSlots[0] ?? "");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    proposeScrim,
    emptyActionState,
  );
  const parsed = parseMatchSlot(selected);
  const label = teamDisplayName(toName, orgTag);

  if (!open) {
    return (
      <button type="button" className="hud-btn" onClick={() => setOpen(true)}>
        Proposer un scrim
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={() => setOpen(false)}
      />
      <form
        action={formAction}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f19] p-6 shadow-2xl"
      >
        <input type="hidden" name="fromTeamId" value={fromTeamId} />
        <input type="hidden" name="toTeamId" value={toTeamId} />
        <input type="hidden" name="weekStartDate" value={weekStartDate} />
        <input type="hidden" name="weekday" value={parsed?.weekday ?? ""} />
        <input type="hidden" name="slot" value={selected} />
        <h3 className="text-lg font-bold uppercase tracking-wide">
          Proposer un scrim
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {label} — choisis un créneau commun.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {commonSlots.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3 py-2 has-[:checked]:border-orange-400/60"
            >
              <input
                type="radio"
                name="slotPick"
                value={value}
                checked={selected === value}
                onChange={() => setSelected(value)}
                className="accent-orange-400"
              />
              <span>{formatMatchSlot(value)}</span>
            </label>
          ))}
        </div>
        {state.message ? (
          <p className={`mt-3 text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
            {state.message}
          </p>
        ) : null}
        <div className="mt-5 flex gap-2">
          <SubmitButton
            pending={pending}
            idleLabel="Envoyer"
            pendingLabel="Envoi…"
          />
          <button type="button" className="hud-btn-ghost" onClick={() => setOpen(false)}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
