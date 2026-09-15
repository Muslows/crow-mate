"use client";

import { enableManagerAccess, enablePlayerAccess } from "@/lib/actions/account";
import { Panel } from "@/components/ui/Panel";

export function EnablePlayerAccessCard() {
  return (
    <Panel className="max-w-xl">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
        Deuxième casquette
      </p>
      <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide">
        Activer le profil joueur
      </h2>
      <p className="mt-3 text-sm text-zinc-400">
        Ton compte manager reste intact. Tu pourras ensuite renseigner SR, rôles,
        héros et expérience, et basculer entre Roster et Profil.
      </p>
      <form action={enablePlayerAccess} className="mt-6">
        <button type="submit" className="hud-btn">
          Créer mon profil joueur
        </button>
      </form>
    </Panel>
  );
}

export function EnableManagerAccessCard() {
  return (
    <Panel className="max-w-xl">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
        Deuxième casquette
      </p>
      <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide">
        Activer l&apos;espace manager
      </h2>
      <p className="mt-3 text-sm text-zinc-400">
        Ton profil joueur est conservé. Tu pourras créer et gérer une équipe
        avec le même email.
      </p>
      <form action={enableManagerAccess} className="mt-6">
        <button type="submit" className="hud-btn">
          Activer la gestion d&apos;équipe
        </button>
      </form>
    </Panel>
  );
}
