"use client";

import { useActionState } from "react";
import { createLftAnnouncement } from "@/lib/actions/announcements";
import { emptyActionState, firstFieldError } from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Panel } from "@/components/ui/Panel";
import { LFT_DESCRIPTION_MAX, LFT_PLATFORMS, LFT_REGIONS } from "@/lib/lft";

export function LftAnnouncementForm({ headline }: { headline: string }) {
  const [state, action, pending] = useActionState(
    createLftAnnouncement,
    emptyActionState,
  );

  return (
    <Panel>
      <form action={action} className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Publier une annonce LFT
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            L’en-tête est généré depuis ton profil (SR, rôle, dispos). Il
            restera au format scène :{" "}
            <span className="font-mono text-zinc-800 dark:text-zinc-100">
              {headline}
            </span>
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-label">
            Région
            <select name="region" className="hud-input" defaultValue="EU">
              {LFT_REGIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Plateforme
            <select name="platform" className="hud-input" defaultValue="PC">
              {LFT_PLATFORMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="form-label">
          Description supplémentaire
          <textarea
            name="description"
            required
            maxLength={LFT_DESCRIPTION_MAX}
            rows={5}
            className="hud-input min-h-28"
            placeholder="Ambitions, héros favoris, mentalité, rythme de jeu…"
          />
          <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
            {LFT_DESCRIPTION_MAX} caractères max.
          </span>
          <FieldError
            id="lft-description-error"
            message={firstFieldError(state.fieldErrors, "description")}
          />
        </label>
        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${
              state.ok
                ? "text-emerald-700 dark:text-lime-300"
                : "text-red-700 dark:text-orange-300"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        <SubmitButton
          pending={pending}
          idleLabel="Publier l’annonce LFT"
          pendingLabel="Publication…"
        />
      </form>
    </Panel>
  );
}
