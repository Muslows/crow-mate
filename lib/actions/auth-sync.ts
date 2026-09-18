"use server";

import { syncAppUserFromAuth } from "@/lib/app-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function syncCurrentAuthUser(): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  try {
    await syncAppUserFromAuth(user);
    return { ok: true };
  } catch (error) {
    console.error("[auth] syncCurrentAuthUser", error);
    return { ok: false };
  }
}
