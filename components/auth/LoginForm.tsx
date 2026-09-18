"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { reconcileDanglingManagerRole } from "@/lib/actions/manager-lifecycle";
import { syncCurrentAuthUser } from "@/lib/actions/auth-sync";
import { signInLocalDev } from "@/lib/actions/local-auth";
import { messageForAuthError } from "@/lib/auth-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { signInSchema } from "@/lib/validations/auth";
import { Spinner } from "@/components/ui/Spinner";

function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/register")) return null;
  return value;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    callbackError === "callback" || callbackError === "missing_code"
      ? "Lien d’authentification invalide ou expiré."
      : callbackError === "supabase_config"
        ? "Supabase n’est pas configuré."
        : null,
  );
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
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
      return;
    }

    setPending(true);
    const next = safeNextPath(searchParams.get("next")) ?? "/profile";

    async function tryLocal(): Promise<boolean> {
      const local = await signInLocalDev({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (local.ok) {
        window.location.assign(next);
        return true;
      }
      setError(local.message);
      return false;
    }

    try {
      if (supabasePublicConfig()) {
        const supabase = createSupabaseBrowserClient();
        const { data, error: signError } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (!signError && data.user) {
          if (!data.user.email_confirmed_at) {
            window.location.assign("/auth/verify-email");
            return;
          }
          try {
            await syncCurrentAuthUser();
            await reconcileDanglingManagerRole();
          } catch (lifecycleError) {
            console.error("[auth] post-login sync", lifecycleError);
          }
          window.location.assign(next);
          return;
        }
        if (await tryLocal()) return;
        if (signError) {
          setError(messageForAuthError(signError, "Connexion impossible."));
          return;
        }
        setError("La session n’a pas pu être créée. Réessaie.");
        return;
      }
    } catch (caught) {
      console.error("[auth] sign-in failed", caught);
      if (await tryLocal()) return;
      setError(
        messageForAuthError(
          caught as { message?: string; code?: string },
          "Connexion impossible. Vérifie ta connexion puis réessaie.",
        ),
      );
    } finally {
      setPending(false);
    }
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
      <label className="form-label">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
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
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner />
            Connexion…
          </span>
        ) : (
          "Entrer"
        )}
      </button>
      <Link
        href="/forgot-password"
        className="text-center text-sm text-muted underline decoration-border underline-offset-4 hover:text-foreground"
      >
        Mot de passe oublié ?
      </Link>
    </form>
  );
}
