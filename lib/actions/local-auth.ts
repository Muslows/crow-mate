"use server";

import { verifyPassword } from "better-auth/crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  DEV_SESSION_COOKIE,
  createDevSessionValue,
  devSessionCookieOptions,
} from "@/lib/dev-session";
import { isLocalAppRuntime } from "@/lib/email-verification";

export async function signInLocalDev(input: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isLocalAppRuntime()) {
    return { ok: false, message: "Connexion locale indisponible." };
  }

  const email = input.email.trim().toLowerCase();
  const user = await db.user.findUnique({
    where: { email },
    include: { accounts: true },
  });
  const account = user?.accounts.find(
    (item) => item.providerId === "credential" && item.password,
  );
  if (!user || !account?.password) {
    return { ok: false, message: "Email ou mot de passe incorrect." };
  }

  const valid = await verifyPassword({
    password: input.password,
    hash: account.password,
  });
  if (!valid) {
    return { ok: false, message: "Email ou mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    DEV_SESSION_COOKIE,
    await createDevSessionValue(user.id),
    devSessionCookieOptions(),
  );
  return { ok: true };
}

export async function signOutLocalDev(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
}
