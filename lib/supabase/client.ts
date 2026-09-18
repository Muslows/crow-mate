"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  const config = supabasePublicConfig();
  if (!config) {
    throw new Error("Supabase n’est pas configuré (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
  }
  return createBrowserClient(config.url, config.anonKey);
}
