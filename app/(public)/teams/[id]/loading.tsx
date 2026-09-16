export default function TeamLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
        Chargement de l&apos;équipe…
      </p>
      <div className="h-36 animate-pulse border border-cyan-400/15 bg-black/30" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 animate-pulse border border-cyan-400/15 bg-black/30" />
        <div className="h-28 animate-pulse border border-cyan-400/15 bg-black/30" />
      </div>
    </main>
  );
}
