"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="hud-btn-ghost"
      onClick={async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
        } catch (error) {
          console.error("[auth] sign-out", error);
        }
        router.push("/");
        router.refresh();
      }}
    >
      Déconnexion
    </button>
  );
}
