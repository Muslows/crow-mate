export default function PlayerCardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="h-4 w-40 animate-pulse bg-cyan-400/10" />
      <div className="h-40 animate-pulse border border-cyan-400/15 bg-black/40" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 animate-pulse border border-cyan-400/15 bg-black/30" />
        <div className="h-24 animate-pulse border border-cyan-400/15 bg-black/30" />
        <div className="h-24 animate-pulse border border-cyan-400/15 bg-black/30" />
      </div>
      <div className="h-48 animate-pulse border border-cyan-400/15 bg-black/30" />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
        Chargement de la fiche…
      </p>
    </main>
  );
}
