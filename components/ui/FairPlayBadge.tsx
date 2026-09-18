import type { FairPlayIndex } from "@/lib/fair-play";

const TONE: Record<string, string> = {
  COURTOIS: "border-lime-800 bg-lime-950/50 text-lime-200",
  BON: "border-cyan-200 bg-cyan-50 text-cyan-800",
  PEU_AGREABLE: "border-orange-800/70 bg-orange-950/40 text-orange-200",
  TOXIQUE_OU_TROLL: "border-red-200 bg-red-50 text-red-800",
};

export function FairPlayBadge({ index }: { index: FairPlayIndex }) {
  const width =
    index.average == null ? 0 : Math.round((index.average / 4) * 100);
  const tone = index.trend ? TONE[index.trend] : "border-border bg-zinc-800/50 text-zinc-400";

  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <p className="text-xs font-medium text-zinc-500">Fair-play</p>
      <p className="mt-0.5 text-sm font-semibold">{index.label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-current opacity-80"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
