"use client";

import { useActionState } from "react";
import { updateDiscordSettings } from "@/lib/actions/account";
import { emptyActionState } from "@/lib/actions/state";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function DiscordSettingsForm({
  discord,
  discordPublic,
}: {
  discord: string;
  discordPublic: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateDiscordSettings,
    emptyActionState,
  );

  return (
    <Panel>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Discord
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Renseigne ton nom d’utilisateur ou ton nom d’affichage Discord.
          </p>
        </div>
        <label className="form-label">
          Identifiant Discord
          <input
            name="discord"
            type="text"
            defaultValue={discord}
            maxLength={64}
            autoComplete="off"
            className="hud-input"
            placeholder="username"
          />
          {state.fieldErrors.discord?.[0] ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.discord[0]}
            </span>
          ) : null}
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          <input
            type="checkbox"
            name="discordPublic"
            value="on"
            defaultChecked={discordPublic}
            className="h-4 w-4 shrink-0 accent-indigo-600 dark:accent-indigo-400"
          />
          Rendre mon Discord public
        </label>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Privé par défaut : visible uniquement par toi et le manager de
          l’équipe que tu as officiellement rejointe.
        </p>
        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${
              state.ok
                ? "text-lime-700 dark:text-lime-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        <SubmitButton
          pending={pending}
          idleLabel="Enregistrer Discord"
          pendingLabel="Enregistrement…"
        />
      </form>
    </Panel>
  );
}
