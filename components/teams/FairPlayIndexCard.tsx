import { Panel } from "@/components/ui/Panel";
import { BEHAVIOR_LABELS, type FairPlayIndex, type OpponentBehavior } from "@/lib/fair-play";

const BARS: { rating: OpponentBehavior; tone: string }[] = [
  { rating: "COURTOIS", tone: "bg-lime-400" },
  { rating: "BON", tone: "bg-cyan-400" },
  { rating: "PEU_AGREABLE", tone: "bg-orange-400" },
  { rating: "TOXIQUE_OU_TROLL", tone: "bg-red-500" },
];

export function FairPlayIndexCard({ index }: { index: FairPlayIndex }) {
  return (
    <Panel>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-400">
        Fair-play index
      </p>
      <p className="mt-2 text-2xl font-semibold uppercase tracking-wide">
        {index.label}
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        {index.total === 0
          ? "Calculé uniquement à partir des rapports de scrims liés à cette équipe."
          : `${index.average}/4 · ${index.total} évaluation${index.total > 1 ? "s" : ""} post-scrim`}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {BARS.map(({ rating, tone }) => {
          const count = index.counts[rating];
          const width =
            index.total === 0 ? 0 : Math.round((count / index.total) * 100);
          return (
            <li key={rating}>
              <div className="mb-1 flex justify-between font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-400">
                <span>{BEHAVIOR_LABELS[rating]}</span>
                <span>{count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
