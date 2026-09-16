import type { FairPlayIndex } from "@/lib/fair-play";

const TONE: Record<string, string> = {
  COURTOIS: "border-lime-400/40 bg-lime-400/10 text-lime-200",
  BON: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  PEU_AGREABLE: "border-orange-400/40 bg-orange-400/10 text-orange-200",
  TOXIQUE_OU_TROLL: "border-red-400/40 bg-red-400/10 text-red-200",
};

export function FairPlayBadge({ index }: { index: FairPlayIndex }) {
  const width =
    index.average == null ? 0 : Math.round((index.average / 4) * 100);
  const tone = index.trend ? TONE[index.trend] : "border-white/10 bg-white/5 text-zinc-400";

  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em]">
        Fair-play
      </p>
      <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide">
        {index.label}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-current opacity-80"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
