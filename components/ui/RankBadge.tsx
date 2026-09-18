import { labelFor, RANK_DIVISIONS } from "@/lib/constants";
import { rankFromSr } from "@/lib/rank";
import type { RankDivision } from "@prisma/client";

const RANK_TONES: Record<RankDivision, string> = {
  UNRANKED:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-border dark:bg-zinc-800/50 dark:text-zinc-400",
  BRONZE:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  SILVER:
    "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
  GOLD: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-200",
  PLATINUM:
    "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200",
  EMERALD:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  DIAMOND:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
  MASTER:
    "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200",
  GRANDMASTER:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
  CHAMPION:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200",
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
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${RANK_TONES[division]}`}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
      {labelFor(RANK_DIVISIONS, division)}
    </span>
  );
}
