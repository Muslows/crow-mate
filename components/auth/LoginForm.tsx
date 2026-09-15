"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/validations/auth";
import { homePathForRole } from "@/lib/roles";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
      return;
    }

    setPending(true);
    const result = await authClient.signIn.email(parsed.data);
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Connexion impossible.");
      return;
    }

    const session = await authClient.getSession();
    const user = session.data?.user as
      | { role?: string; isManager?: boolean; isPlayer?: boolean }
      | undefined;
    const nextParam = searchParams.get("next");
    const fallback = homePathForRole({
      role: user?.role,
      isManager: user?.isManager,
      isPlayer: user?.isPlayer,
    });
    const next = nextParam && nextParam.startsWith("/") ? nextParam : fallback;
    router.push(next);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Email
        <input name="email" type="email" required className="hud-input" />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Mot de passe
        <input name="password" type="password" required minLength={8} className="hud-input" />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-orange-400">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="hud-btn">
        {pending ? "Connexion…" : "Entrer"}
      </button>
    </form>
  );
}
