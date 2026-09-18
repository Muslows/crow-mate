"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { AvailabilityMatrixSkeleton } from "@/components/planning/AvailabilityMatrix";

export function PlanningWeekFrame({
  offset,
  currentLabel,
  nextLabel,
  children,
}: {
  offset: 0 | 1;
  currentLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function go(next: 0 | 1) {
    if (next === offset) return;
    startTransition(() => {
      router.push(`${pathname}?w=${next}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex flex-wrap gap-2" aria-label="Semaine du planning">
        <button
          type="button"
          onClick={() => go(0)}
          className={`rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-200 ${
            offset === 0
              ? "border border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-400/60 dark:bg-orange-400/15 dark:text-orange-200"
              : "border border-zinc-300 text-zinc-600 hover:text-cyan-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-cyan-200"
          }`}
        >
          Semaine en cours · {currentLabel}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className={`rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-200 ${
            offset === 1
              ? "border border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-400/60 dark:bg-orange-400/15 dark:text-orange-200"
              : "border border-zinc-300 text-zinc-600 hover:text-cyan-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-cyan-200"
          }`}
        >
          Semaine suivante · {nextLabel}
        </button>
      </nav>
      {pending ? <AvailabilityMatrixSkeleton /> : children}
    </div>
  );
}
