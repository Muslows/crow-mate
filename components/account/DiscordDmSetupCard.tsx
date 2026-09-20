"use client";

import { useActionState } from "react";
import {
  testDiscordDirectMessage,
  unlinkDiscordAccount,
} from "@/lib/actions/discord";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Panel } from "@/components/ui/Panel";

function Message({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
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
  );
}

export function DiscordDmSetupCard({
  configured,
  inviteUrl,
  linked,
}: {
  configured: boolean;
  inviteUrl: string | null;
  linked: {
    username: string;
    dmBlocked: boolean;
  } | null;
}) {
  const [testState, testAction, testPending] = useActionState(
    testDiscordDirectMessage,
    emptyActionState,
  );
  const [unlinkState, unlinkAction, unlinkPending] = useActionState(
    unlinkDiscordAccount,
    emptyActionState,
  );

  return (
    <Panel>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Alertes Discord en message privé
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Le bot n’a pas besoin d’être installé sur ton serveur. Rejoins le
              Discord officiel de la plateforme, associe ton compte, puis
              autorise les MP des membres du serveur pour recevoir les demandes
              de scrim, les messages et les annulations.
            </p>
          </div>
          <span
            className={`self-start rounded-full border px-2.5 py-1 text-xs font-medium ${
              linked
                ? "border-lime-300 bg-lime-50 text-lime-800 dark:border-lime-800 dark:bg-lime-950/50 dark:text-lime-200"
                : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {linked ? "Compte associé" : "Non associé"}
          </span>
        </div>

        {linked?.dmBlocked ? (
          <p
            role="alert"
            className="rounded-xl border border-orange-300 bg-orange-50 p-3 text-sm text-orange-950 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-100"
          >
            Veuillez rejoindre le Discord officiel de la plateforme et y
            activer les MP des membres du serveur pour recevoir nos alertes.
          </p>
        ) : null}

        <ol className="grid gap-3">
          <li className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
              Étape 1
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Rejoindre le Discord officiel
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Le bot y est déjà présent. Sans serveur en commun, Discord bloque
              les messages privés.
            </p>
            {inviteUrl ? (
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="hud-btn mt-3"
              >
                1. Rejoindre le Discord Officiel de la Plateforme
              </a>
            ) : (
              <p className="mt-3 text-sm text-orange-700 dark:text-orange-300">
                Le lien d’invitation n’est pas encore configuré sur ce
                déploiement.
              </p>
            )}
          </li>
          <li className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
              Étape 2
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Associer ton identifiant Discord
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Clique sur le bouton ci-dessous depuis cette page (session
              connectée). Ne copie pas le lien du générateur OAuth2 du portail
              Discord : ce lien n’a pas le cookie de sécurité, et il ajoute
              souvent <code>integration_type</code> qui déclenche « Corps de
              formulaire non valide ».
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Le local est supporté. Dans le portail, Redirects doit contenir
              exactement{" "}
              <code className="break-all rounded bg-white px-1 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                http://localhost:3000/api/discord/callback
              </code>
              .
            </p>
            {configured ? (
              <a href="/api/discord/install" className="hud-btn mt-3">
                2. Associer mon compte Discord
              </a>
            ) : (
              <p className="mt-3 text-sm text-orange-700 dark:text-orange-300">
                Les secrets Discord ne sont pas configurés sur ce déploiement.
              </p>
            )}
          </li>
        </ol>

        {linked ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Associé en tant que{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {linked.username}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <form action={testAction}>
                <SubmitButton
                  pending={testPending}
                  idleLabel="Envoyer un MP de test"
                  pendingLabel="Envoi…"
                />
              </form>
              <form action={unlinkAction}>
                <button
                  type="submit"
                  disabled={unlinkPending}
                  className="hud-btn-ghost"
                >
                  {unlinkPending ? "Suppression…" : "Dissocier Discord"}
                </button>
              </form>
            </div>
            <Message state={testState} />
            <Message state={unlinkState} />
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
