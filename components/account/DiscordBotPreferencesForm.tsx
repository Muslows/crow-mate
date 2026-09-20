"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateDiscordBotPreferences } from "@/lib/actions/discord";
import { emptyActionState } from "@/lib/actions/state";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";

export type DiscordBotPreferenceFlags = {
  notifyDiscordMessages: boolean;
  notifyDiscordInvitations: boolean;
  notifyDiscordScrims: boolean;
  notifyDiscordCancellations: boolean;
};

const OPTIONS: {
  name: keyof DiscordBotPreferenceFlags;
  label: string;
  hint: string;
  recommended?: boolean;
}[] = [
  {
    name: "notifyDiscordMessages",
    label: "M'informer des nouveaux messages privés reçus sur le site.",
    hint: "MP de recrutement, échange staff ou discussion de scrim.",
  },
  {
    name: "notifyDiscordInvitations",
    label: "M'informer des invitations à rejoindre une équipe ou une structure.",
    hint: "Roster, club et affiliation de structure.",
  },
  {
    name: "notifyDiscordScrims",
    label: "M'informer des propositions de Scrims reçues.",
    hint: "Demandes de matchmaking envoyées à tes équipes.",
  },
  {
    name: "notifyDiscordCancellations",
    label: "M'informer des annulations de Scrims.",
    hint: "Alerte prioritaire si l’adversaire annule un match validé.",
    recommended: true,
  },
];

function PreferenceSwitch({
  name,
  label,
  hint,
  recommended,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  recommended?: boolean;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-zinc-300 bg-white p-4 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:border-zinc-600 dark:bg-zinc-950 dark:has-[:checked]:border-orange-400 dark:has-[:checked]:bg-orange-950/40">
      <input
        type="checkbox"
        name={name}
        value="on"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-zinc-500 accent-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-zinc-300 dark:accent-orange-400"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {label}
          </span>
          {recommended ? (
            <span className="rounded-full border border-orange-400 bg-orange-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-900 dark:border-orange-500/70 dark:bg-orange-950/70 dark:text-orange-100">
              Recommandé
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-300">
          {hint}
        </span>
      </span>
    </label>
  );
}

export function DiscordBotPreferencesForm({
  linked,
  preferences,
}: {
  linked: boolean;
  preferences: DiscordBotPreferenceFlags;
}) {
  const [state, formAction, pending] = useActionState(
    updateDiscordBotPreferences,
    emptyActionState,
  );

  return (
    <Panel>
      <form action={formAction} className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Préférences d’alertes
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Chaque type d’événement peut être activé ou coupé. Une option
            désactivée n’empêche pas la notification interne du site : seul le
            message privé Discord est ignoré.
          </p>
        </div>
        {!linked ? (
          <p
            role="status"
            className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100"
          >
            Associe d’abord ton compte depuis{" "}
            <Link
              href="/profile/settings/notifications"
              className="font-semibold underline underline-offset-2"
            >
              Notifications (Bot)
            </Link>{" "}
            pour que ces choix produisent un MP.
          </p>
        ) : null}
        <fieldset className="grid gap-3">
          <legend className="sr-only">Types de notifications Discord</legend>
          {OPTIONS.map((option) => (
            <PreferenceSwitch
              key={option.name}
              name={option.name}
              label={option.label}
              hint={option.hint}
              recommended={option.recommended}
              defaultChecked={preferences[option.name]}
            />
          ))}
        </fieldset>
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
          idleLabel="Enregistrer les préférences"
          pendingLabel="Enregistrement…"
        />
      </form>
    </Panel>
  );
}
