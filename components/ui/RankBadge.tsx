import { labelFor, RANK_DIVISIONS } from "@/lib/constants";
import { rankFromSr } from "@/lib/rank";
import type { RankDivision } from "@prisma/client";

const RANK_TONES: Record<RankDivision, string> = {
  UNRANKED: "border-zinc-500 text-zinc-400",
  BRONZE: "border-amber-800 text-amber-600",
  SILVER: "border-zinc-300 text-zinc-200",
  GOLD: "border-yellow-400 text-yellow-300",
  PLATINUM: "border-cyan-300 text-cyan-200",
  EMERALD: "border-emerald-400 text-emerald-300",
  DIAMOND: "border-sky-400 text-sky-300",
  MASTER: "border-purple-400 text-purple-300",
  GRANDMASTER: "border-red-400 text-red-300",
  CHAMPION: "border-orange-400 text-orange-300",
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
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${RANK_TONES[division]}`}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
      {labelFor(RANK_DIVISIONS, division)}
    </span>
  );
}
