"use client";

import { type FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { publicAppUrl, supabasePublicConfig } from "@/lib/supabase/config";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Spinner } from "@/components/ui/Spinner";

const GENERIC_SENT =
  "Si un compte existe pour cette adresse, un email de réinitialisation a été envoyé.";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!supabasePublicConfig()) {
      setError("Supabase n’est pas configuré.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email invalide.");
      return;
    }

    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : publicAppUrl();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        parsed.data.email,
        { redirectTo: `${origin}/auth/callback?next=/auth/reset-password` },
      );
      if (resetError) {
        console.error("[auth] password reset request", resetError);
        const message = resetError.message.toLowerCase();
        if (
          message.includes("api key") ||
          message.includes("jwt") ||
          resetError.status === 401
        ) {
          setError(
            "Clé API Supabase invalide. Colle la Publishable key complète (sb_publishable_…) ou la clé Legacy anon (eyJ…) dans NEXT_PUBLIC_SUPABASE_ANON_KEY, puis relance npm run dev.",
          );
          return;
        }
      }
      setSent(true);
    } catch (caught) {
      console.error("[auth] password reset request failed", caught);
      setError("Envoi impossible pour le moment. Réessaie.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return <p className="text-sm text-muted">{GENERIC_SENT}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="form-label">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
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
            Envoi…
          </span>
        ) : (
          "Envoyer le lien"
        )}
      </button>
    </form>
  );
}
