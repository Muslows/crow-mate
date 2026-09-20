"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/config";

export function AuthHashHandler() {
  useEffect(() => {
    if (!supabasePublicConfig()) return;
    const hash = window.location.hash;
    if (!hash.includes("access_token") && !hash.includes("refresh_token")) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("[auth] hash session", error);
        return;
      }
      if (!data.session) return;
      const next = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", next || "/");
      if (window.location.pathname === "/" || window.location.pathname === "") {
        window.location.replace("/profile/settings");
      } else {
        window.location.reload();
      }
    });
  }, []);

  return null;
}
