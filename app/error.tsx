"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <p className="section-kicker">Erreur serveur</p>
      <h1 className="text-3xl font-bold uppercase tracking-wide">
        Cette page n&apos;a pas pu charger
      </h1>
      <p className="text-sm text-zinc-400">
        Souvent la base Postgres n&apos;est pas joignable (mot de passe
        DATABASE_URL / DIRECT_URL). Vérifie les variables Vercel puis
        redéploie.
      </p>
      <button type="button" className="hud-btn w-fit" onClick={reset}>
        Réessayer
      </button>
    </main>
  );
}
