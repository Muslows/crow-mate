"use client";

import { type FormEvent, useState } from "react";
import { messageForAuthError } from "@/lib/auth-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Spinner } from "@/components/ui/Spinner";

export function ResetPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!supabasePublicConfig()) {
      setError("Supabase n’est pas configuré.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
      return;
    }

    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });
      if (updateError) {
        setError(
          messageForAuthError(
            updateError,
            "Lien expiré ou session de récupération absente. Demande un nouveau reset.",
          ),
        );
        return;
      }
      setDone(true);
    } catch (caught) {
      console.error("[auth] reset password failed", caught);
      setError("Impossible de mettre à jour le mot de passe. Réessaie.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-muted">
        Mot de passe mis à jour. Tu peux maintenant{" "}
        <a href="/login" className="text-orange-500 underline dark:text-orange-400">
          te connecter
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="form-label">
        Nouveau mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="hud-input"
        />
      </label>
      <label className="form-label">
        Confirmation
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="hud-input"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="hud-btn">
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Enregistrement…
          </span>
        ) : (
          "Enregistrer"
        )}
      </button>
    </form>
  );
}
