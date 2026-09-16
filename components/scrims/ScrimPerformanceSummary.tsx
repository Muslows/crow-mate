import { generateScrimSummary } from "@/lib/scrim-summary";
import type { ScrimMapOutcome } from "@prisma/client";

const TONE: Record<
  "lime" | "cyan" | "orange" | "red",
  string
> = {
  lime: "border-lime-400/50 bg-lime-400/10 text-lime-200",
  cyan: "border-cyan-400/50 bg-cyan-400/10 text-cyan-200",
  orange: "border-orange-400/50 bg-orange-400/10 text-orange-200",
  red: "border-red-400/50 bg-red-400/10 text-red-200",
};

export function ScrimPerformanceSummary({
  maps,
}: {
  maps: Array<{ outcome: ScrimMapOutcome; intensity: number }>;
}) {
  const summary = generateScrimSummary(maps);
  if (!summary) return null;
  return (
    <div className={`mt-4 border px-4 py-3 ${TONE[summary.tone]}`}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
        Résumé de performance
      </p>
      <p className="mt-1 text-lg font-semibold uppercase tracking-wide">
        {summary.label}
      </p>
    </div>
  );
}
