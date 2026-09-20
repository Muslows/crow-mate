"use server";

import { syncAppUserFromAuth } from "@/lib/app-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function syncCurrentAuthUser(): Promise<{
  ok: boolean;
  deactivated: boolean;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, deactivated: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, deactivated: false };
  try {
    const appUser = await syncAppUserFromAuth(user);
    return { ok: true, deactivated: Boolean(appUser.deactivatedAt) };
  } catch (error) {
    console.error("[auth] syncCurrentAuthUser", error);
    return { ok: false, deactivated: false };
  }
}
