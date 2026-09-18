"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { syncCurrentAuthUser } from "@/lib/actions/auth-sync";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { Spinner } from "@/components/ui/Spinner";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/profile";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/profile";
  if (value.startsWith("/auth/verify-email")) return "/profile";
  return value;
}

export function EmailConfirmedStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState("Confirmation de ton adresse…");

  useEffect(() => {
    if (!supabasePublicConfig()) {
      setStatus("error");
      setMessage("Supabase n’est pas configuré.");
      return;
    }

    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    if (code || tokenHash) {
      const callback = new URL("/auth/callback", window.location.origin);
      searchParams.forEach((value, key) => {
        callback.searchParams.set(key, value);
      });
      if (!callback.searchParams.get("next")) {
        callback.searchParams.set("next", "/auth/email-confirmed");
      }
      window.location.replace(callback.pathname + callback.search);
      return;
    }

    const destination = safeNext(searchParams.get("next"));
    let cancelled = false;
    let redirectTimer: number | undefined;

    void (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user?.email_confirmed_at) {
          setStatus("error");
          setMessage(
            "Le lien n’a pas pu confirmer ton adresse. Connecte-toi ou demande un nouvel email.",
          );
          return;
        }
        await syncCurrentAuthUser();
        if (cancelled) return;
        setStatus("ok");
        setMessage("Ton adresse email est validée. Connexion en cours…");
        redirectTimer = window.setTimeout(() => {
          router.replace(destination);
        }, 1400);
      } catch (error) {
        if (cancelled) return;
        console.error("[auth] email confirmed", error);
        setStatus("error");
        setMessage("Confirmation impossible pour le moment.");
      }
    })();

    return () => {
      cancelled = true;
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
  }, [router, searchParams]);

  return (
    <div className="flex flex-col gap-3 text-sm text-muted">
      {status === "pending" || status === "ok" ? (
        <p className="inline-flex items-center gap-2 text-foreground">
          <Spinner />
          {message}
        </p>
      ) : (
        <p className="text-red-500 dark:text-red-400">{message}</p>
      )}
      {status === "error" ? (
        <a href="/login" className="hud-btn self-start">
          Se connecter
        </a>
      ) : null}
    </div>
  );
}
