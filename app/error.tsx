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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        En local : Postgres (`npm run db:up`) puis{" "}
        <code>npm run db:migrate:deploy</code>. En production : vérifie
        DATABASE_URL (pooler Supabase :6543) sur Vercel.
      </p>
      <button type="button" className="hud-btn w-fit" onClick={reset}>
        Réessayer
      </button>
    </main>
  );
}
