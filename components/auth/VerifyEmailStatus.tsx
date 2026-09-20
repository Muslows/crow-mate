"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { signupEmailRedirectTo } from "@/lib/email-verification";
import { Spinner } from "@/components/ui/Spinner";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const fromSignup = searchParams.get("signup") === "1";
  const emailFromQuery = searchParams.get("email")?.trim() ?? "";
  const isConfigured = Boolean(supabasePublicConfig());
  const [status, setStatus] = useState<"pending" | "wait" | "exists" | "error">(
    isConfigured ? (fromSignup ? "wait" : "pending") : "error",
  );
  const [email, setEmail] = useState(emailFromQuery);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [message, setMessage] = useState(
    !isConfigured
      ? "Supabase n’est pas configuré."
      : fromSignup
        ? emailFromQuery
          ? `Un email de confirmation a été envoyé à ${emailFromQuery}. Ouvre-le et clique le lien pour activer le compte.`
          : "Consulte ta boîte mail et clique le lien de confirmation pour activer le compte."
        : "Préparation de la vérification…",
  );

  useEffect(() => {
    if (!isConfigured) return;
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        const resolvedEmail = emailFromQuery || user?.email || "";
        setEmail(resolvedEmail);

        if (fromSignup) {
          if (user?.email_confirmed_at) {
            await supabase.auth.signOut();
            if (cancelled) return;
            setStatus("exists");
            setMessage(
              "Un compte est déjà actif avec cet email. Les données du site ont pu être effacées, mais l’authentification existe encore. Connecte-toi plutôt que de réinscrire la même adresse.",
            );
            return;
          }
          setStatus("wait");
          setMessage(
            resolvedEmail
              ? `Un email de confirmation a été envoyé à ${resolvedEmail}. Ouvre-le et clique le lien pour activer le compte.`
              : "Consulte ta boîte mail et clique le lien de confirmation pour activer le compte.",
          );
          return;
        }

        if (user?.email_confirmed_at) {
          window.location.replace("/profile/settings");
          return;
        }

        setStatus("wait");
        setMessage(
          resolvedEmail
            ? `Consulte la boîte mail de ${resolvedEmail} et clique le lien Supabase. Après confirmation, tu seras connecté.`
            : "Consulte ta boîte mail et clique le lien Supabase. Après confirmation, tu seras connecté.",
        );
      } catch (error) {
        if (cancelled) return;
        console.error("[auth] verify email", error);
        setStatus("error");
        setMessage("Vérification impossible pour le moment.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [emailFromQuery, fromSignup, isConfigured]);

  async function resend() {
    if (resendPending || !email) return;
    setResendPending(true);
    setResendMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: signupEmailRedirectTo(window.location.origin) },
      });
      if (error) {
        console.error("[auth] resend verification", error);
      }
      setResendMessage("Si un compte correspond, un nouvel email a été envoyé.");
    } catch (error) {
      console.error("[auth] resend verification", error);
      setResendMessage("Envoi impossible pour le moment. Réessaie.");
    } finally {
      setResendPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 text-sm text-muted">
      {status === "pending" ? (
        <p className="inline-flex items-center gap-2 text-foreground">
          <Spinner />
          {message}
        </p>
      ) : (
        <p
          className={
            status === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-700 dark:text-zinc-300"
          }
        >
          {message}
        </p>
      )}
      {resendMessage ? (
        <p className="text-zinc-600 dark:text-zinc-400">{resendMessage}</p>
      ) : null}
      {status === "wait" && email ? (
        <button
          type="button"
          onClick={() => void resend()}
          disabled={resendPending}
          className="hud-btn-ghost self-start"
        >
          {resendPending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Envoi…
            </span>
          ) : (
            "Renvoyer l’email"
          )}
        </button>
      ) : null}
      {status === "exists" ? (
        <Link href="/login" className="hud-btn self-start">
          Se connecter
        </Link>
      ) : null}
    </div>
  );
}
