"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  changeAccountEmail,
  changeAccountPassword,
  resendAccountVerification,
} from "@/lib/actions/account";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";

function FormMessage({ state }: { state: ActionState }) {
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

function FieldError({
  state,
  name,
}: {
  state: ActionState;
  name: string;
}) {
  const error = state.fieldErrors[name]?.[0];
  return error ? (
    <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
  ) : null;
}

export function AccountSecurityForms({
  email,
  emailVerified,
  pendingEmail,
}: {
  email: string;
  emailVerified: boolean;
  pendingEmail: string | null;
}) {
  const [emailState, emailAction, emailPending] = useActionState(
    changeAccountEmail,
    emptyActionState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendAccountVerification,
    emptyActionState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changeAccountPassword,
    emptyActionState,
  );
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const isVerified = emailVerified && !pendingEmail;

  useEffect(() => {
    if (passwordState.ok) passwordFormRef.current?.reset();
  }, [passwordState.ok]);

  return (
    <>
      <Panel>
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                Email du compte
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Adresse active : {email}
              </p>
            </div>
            <Badge tone={isVerified ? "green" : "orange"}>
              {isVerified ? "Vérifié" : "Non vérifié"}
            </Badge>
          </div>

          {pendingEmail ? (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-100">
              Confirmation en attente pour <strong>{pendingEmail}</strong>.
              L’ancienne adresse reste active jusqu’à validation.
            </div>
          ) : null}

          {!isVerified ? (
            <form action={resendAction} className="flex flex-col items-start gap-2">
              <SubmitButton
                pending={resendPending}
                idleLabel="Renvoyer l’email de confirmation"
                pendingLabel="Envoi…"
              />
              <FormMessage state={resendState} />
            </form>
          ) : null}

          <form action={emailAction} className="flex flex-col gap-3">
            <label className="form-label">
              Nouvelle adresse email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="hud-input"
                placeholder="nouvelle@adresse.fr"
              />
              <FieldError state={emailState} name="email" />
            </label>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Supabase enverra un lien sécurisé à la nouvelle adresse.
            </p>
            <FormMessage state={emailState} />
            <SubmitButton
              pending={emailPending}
              idleLabel="Modifier l’email"
              pendingLabel="Modification…"
            />
          </form>
        </div>
      </Panel>

      <Panel>
        <form
          ref={passwordFormRef}
          action={passwordAction}
          className="flex flex-col gap-4"
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
              Mot de passe
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Une réauthentification est exigée avant toute modification.
            </p>
          </div>
          <label className="form-label">
            Mot de passe actuel
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className="hud-input"
            />
            <FieldError state={passwordState} name="currentPassword" />
          </label>
          <label className="form-label">
            Nouveau mot de passe
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              className="hud-input"
            />
            <FieldError state={passwordState} name="password" />
          </label>
          <label className="form-label">
            Confirmer le nouveau mot de passe
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              className="hud-input"
            />
            <FieldError state={passwordState} name="confirm" />
          </label>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            12 caractères minimum, avec majuscule, minuscule, chiffre et
            caractère spécial.
          </p>
          <FormMessage state={passwordState} />
          <SubmitButton
            pending={passwordPending}
            idleLabel="Modifier le mot de passe"
            pendingLabel="Modification…"
          />
        </form>
      </Panel>
    </>
  );
}
