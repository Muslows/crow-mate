import { labelFor, RANK_DIVISIONS } from "@/lib/constants";
import { rankFromSr } from "@/lib/rank";
import type { RankDivision } from "@prisma/client";

const RANK_TONES: Record<RankDivision, string> = {
  UNRANKED: "border-border bg-zinc-800/50 text-zinc-400",
  BRONZE: "border-amber-800 bg-amber-950/50 text-amber-200",
  SILVER: "border-zinc-300 bg-zinc-800 text-zinc-300",
  GOLD: "border-yellow-200 bg-yellow-50 text-yellow-800",
  PLATINUM: "border-cyan-200 bg-cyan-50 text-cyan-800",
  EMERALD: "border-emerald-800 bg-emerald-950/50 text-emerald-200",
  DIAMOND: "border-sky-800 bg-sky-950/50 text-sky-200",
  MASTER: "border-purple-200 bg-purple-50 text-purple-800",
  GRANDMASTER: "border-red-200 bg-red-50 text-red-800",
  CHAMPION: "border-orange-800/70 bg-orange-950/40 text-orange-200",
};

export function RankBadge({
  sr,
  rank,
}: {
  sr?: number;
  rank?: RankDivision;
}) {
  const division = rank ?? rankFromSr(sr ?? 0);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${RANK_TONES[division]}`}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
      {labelFor(RANK_DIVISIONS, division)}
    </span>
  );
}
