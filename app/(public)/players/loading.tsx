export default function PlayersLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="h-8 w-48 animate-pulse bg-cyan-400/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 animate-pulse border border-cyan-400/15 bg-black/30" />
        <div className="h-36 animate-pulse border border-cyan-400/15 bg-black/30" />
        <div className="h-36 animate-pulse border border-cyan-400/15 bg-black/30" />
      </div>
    </main>
  );
}
