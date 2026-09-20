"use server";

import { db } from "@/lib/db";
import { syncAppUserFromAuth } from "@/lib/app-user";
import {
  createSupabaseAdminClient,
  findAuthUserByEmail,
} from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validations/auth";

export async function syncCurrentAuthUser(): Promise<{
  ok: boolean;
  deactivated: boolean;
  message?: string;
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
    return {
      ok: false,
      deactivated: false,
      message:
        error instanceof Error
          ? error.message
          : "Le profil n’a pas pu être créé. Vérifie que les migrations Prisma sont appliquées.",
    };
  }
}

export async function recycleOrphanAuthSignup(
  email: string,
): Promise<"exists" | "recycled" | "pending"> {
  const parsed = signInSchema.shape.email.safeParse(email);
  if (!parsed.success) return "pending";
  const normalized = parsed.data.toLowerCase();

  const appUser = await db.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  if (appUser) return "exists";

  const authUser = await findAuthUserByEmail(normalized);
  if (!authUser) return "pending";
  if (!authUser.email_confirmed_at) return "pending";

  const admin = createSupabaseAdminClient();
  if (!admin) return "pending";
  const { error } = await admin.auth.admin.deleteUser(authUser.id);
  if (error) {
    console.error("[auth] recycle orphan signup", error);
    return "exists";
  }
  return "recycled";
}
