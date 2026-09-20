import Link from "next/link";
import type { ReactNode } from "react";
import { SettingsNav } from "@/components/account/SettingsNav";
import { requireAuthSession } from "@/lib/session";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthSession();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
          Compte
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Paramètres
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Gère ton compte, ton identité compétitive, tes rôles et les
          alertes Discord, y compris les préférences du bot.
        </p>
        <Link href="/profile" className="mt-4 inline-block hud-btn-ghost">
          Retour au profil
        </Link>
      </header>
      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside>
          <SettingsNav />
        </aside>
        <section className="min-w-0 space-y-6">{children}</section>
      </div>
    </main>
  );
}
