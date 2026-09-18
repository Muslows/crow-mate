"use client";

import { type FormEvent, useState } from "react";
import { syncCurrentAuthUser } from "@/lib/actions/auth-sync";
import { messageForAuthError } from "@/lib/auth-errors";
import { publicAppUrl, supabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validations/auth";
import { Spinner } from "@/components/ui/Spinner";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!supabasePublicConfig()) {
      setError("Supabase n’est pas configuré. Ajoute NEXT_PUBLIC_SUPABASE_URL et ANON_KEY.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
      return;
    }

    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : publicAppUrl();
      const { data, error: signError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/auth/email-confirmed`,
          data: { name: parsed.data.name },
        },
      });
      if (signError) {
        setError(messageForAuthError(signError, "Inscription impossible."));
        return;
      }
      if (data.session && data.user?.email_confirmed_at) {
        await syncCurrentAuthUser();
        window.location.assign("/profile");
        return;
      }
      await syncCurrentAuthUser();
      window.location.assign("/auth/verify-email");
    } catch (caught) {
      console.error("[auth] sign-up failed", caught);
      setError(
        messageForAuthError(
          caught as { message?: string; code?: string },
          "Inscription impossible. Réessaie.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="form-label">
        Nom
        <input name="name" required minLength={2} className="hud-input" />
      </label>
      <label className="form-label">
        Email
        <input name="email" type="email" required className="hud-input" />
      </label>
      <label className="form-label">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="hud-input"
        />
      </label>
      <p className="text-xs text-muted">
        Un email de confirmation est envoyé par Supabase. Ton compte démarre en
        joueur.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="hud-btn">
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Création…
          </span>
        ) : (
          "Créer le compte"
        )}
      </button>
    </form>
  );
}
