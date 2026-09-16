export function DashboardSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="h-8 w-48 animate-pulse border border-cyan-400/15 bg-black/30" />
      <div className="h-24 animate-pulse border border-cyan-400/15 bg-black/30" />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse border border-cyan-400/15 bg-black/30"
        />
      ))}
    </main>
  );
}
