"use client";

import { useActionState } from "react";
import { updateCasterProfile } from "@/lib/actions/account";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { FieldError } from "@/components/forms/FieldError";
import { firstFieldError } from "@/lib/actions/state";

export function CasterProfileForm({
  profile,
}: {
  profile: { streamUrl: string; vodUrl: string; eventsNote: string };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCasterProfile,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Lien stream
        <input
          name="streamUrl"
          type="url"
          defaultValue={profile.streamUrl}
          placeholder="https://twitch.tv/…"
          className="hud-input"
        />
        <FieldError
          id="caster-stream-error"
          message={firstFieldError(state.fieldErrors, "streamUrl")}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Lien VOD
        <input
          name="vodUrl"
          type="url"
          defaultValue={profile.vodUrl}
          placeholder="https://youtube.com/…"
          className="hud-input"
        />
        <FieldError
          id="caster-vod-error"
          message={firstFieldError(state.fieldErrors, "vodUrl")}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Événements commentés
        <textarea
          name="eventsNote"
          rows={4}
          defaultValue={profile.eventsNote}
          className="hud-input min-h-24"
        />
        <FieldError
          id="caster-events-error"
          message={firstFieldError(state.fieldErrors, "eventsNote")}
        />
      </label>
      {state.message ? (
        <p
          role="status"
          className={state.ok ? "text-sm text-cyan-300" : "text-sm text-orange-400"}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel="Enregistrer"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
