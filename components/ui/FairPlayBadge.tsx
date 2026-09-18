import type { FairPlayIndex } from "@/lib/fair-play";

const TONE: Record<string, string> = {
  COURTOIS:
    "border-lime-200 bg-lime-50 text-lime-800 dark:border-lime-800 dark:bg-lime-950/50 dark:text-lime-200",
  BON: "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200",
  PEU_AGREABLE:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200",
  TOXIQUE_OU_TROLL:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
};

export function FairPlayBadge({ index }: { index: FairPlayIndex }) {
  const width =
    index.average == null ? 0 : Math.round((index.average / 4) * 100);
  const tone = index.trend
    ? TONE[index.trend]
    : "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-border dark:bg-zinc-800/50 dark:text-zinc-400";

  return (
    <div
      className={`rounded-xl border px-3 py-2 transition-colors duration-200 ${tone}`}
    >
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Fair-play
      </p>
      <p className="mt-0.5 text-sm font-semibold">{index.label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 transition-colors duration-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-current opacity-80"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
