"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { Spinner } from "@/components/ui/Spinner";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    if (pending) return;
    setPending(true);
    setMessage(null);
    try {
      if (!supabasePublicConfig()) {
        setMessage("Supabase n’est pas configuré.");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/email-confirmed`,
        },
      });
      if (error) {
        console.error("[auth] resend verification", error);
      }
      setMessage("Si un compte correspond, un nouvel email a été envoyé.");
    } catch (error) {
      console.error("[auth] resend verification", error);
      setMessage("Envoi impossible pour le moment. Réessaie.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto mt-2 flex max-w-6xl items-start justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100">
      <p>
        Veuillez vérifier votre adresse email pour activer toutes les
        fonctionnalités.
        {message ? (
          <span className="mt-1 block text-amber-800/80 dark:text-amber-200/80">
            {message}
          </span>
        ) : null}
      </p>
      <button
        type="button"
        onClick={() => void resend()}
        disabled={pending}
        className="hud-btn-ghost shrink-0"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Envoi…
          </span>
        ) : (
          "Renvoyer"
        )}
      </button>
    </div>
  );
}
