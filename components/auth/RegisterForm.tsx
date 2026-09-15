"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validations/auth";
import { homePathForRole } from "@/lib/roles";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
      return;
    }

    setPending(true);
    const result = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role,
    } as Parameters<typeof authClient.signUp.email>[0]);
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Inscription impossible.");
      return;
    }

    router.push(
      homePathForRole({
        role: parsed.data.role,
        isManager: parsed.data.role === "MANAGER",
        isPlayer: parsed.data.role === "PLAYER",
      }),
    );
    router.refresh();
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Nom
        <input name="name" required minLength={2} className="hud-input" />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Email
        <input name="email" type="email" required className="hud-input" />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Mot de passe
        <input name="password" type="password" required minLength={8} className="hud-input" />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs uppercase tracking-[0.16em] text-zinc-400">
          Espace de départ
        </legend>
        <p className="text-xs text-zinc-500">
          Tu pourras activer l&apos;autre casquette plus tard, sans changer d&apos;email.
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input type="radio" name="role" value="MANAGER" defaultChecked />
          Manager — je gère une équipe
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input type="radio" name="role" value="PLAYER" />
          Joueur — je mets à jour mon profil
        </label>
      </fieldset>
      {error ? (
        <p role="alert" className="text-sm text-orange-400">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="hud-btn">
        {pending ? "Création…" : "Créer le compte"}
      </button>
    </form>
  );
}
