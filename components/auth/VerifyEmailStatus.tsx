"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { Spinner } from "@/components/ui/Spinner";

export function VerifyEmailStatus() {
  const [status, setStatus] = useState<"pending" | "ok" | "wait" | "error">(
    "pending",
  );
  const [message, setMessage] = useState("Vérification du compte…");

  useEffect(() => {
    if (!supabasePublicConfig()) {
      setStatus("error");
      setMessage("Supabase n’est pas configuré.");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (user?.email_confirmed_at) {
          setStatus("ok");
          setMessage("Adresse email confirmée. Tu peux continuer.");
          return;
        }
        setStatus("wait");
        setMessage(
          "Consulte ta boîte mail et clique le lien Supabase. Ensuite, reviens ici.",
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
  }, []);

  return (
    <div className="flex flex-col gap-3 text-sm text-muted">
      {status === "pending" ? (
        <p className="inline-flex items-center gap-2">
          <Spinner />
          {message}
        </p>
      ) : (
        <p className={status === "error" ? "text-red-500 dark:text-red-400" : undefined}>
          {message}
        </p>
      )}
      {status === "ok" ? (
        <a href="/profile" className="hud-btn self-start">
          Continuer
        </a>
      ) : null}
    </div>
  );
}
