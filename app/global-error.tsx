"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-4 px-4 py-16">
        <h1 className="text-3xl font-bold">Cette page n&apos;a pas pu charger</h1>
        <p>
          En production, vérifie DATABASE_URL (pooler Supabase :6543) et les
          clés NEXT_PUBLIC_SUPABASE_* sur Vercel.
        </p>
        <button type="button" onClick={reset}>
          Réessayer
        </button>
      </body>
    </html>
  );
}
