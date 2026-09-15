"use client";

import { useState } from "react";
import { SR_MAX, SR_MIN, SR_STEP, snapSr } from "@/lib/rank";

export function SrRangeFilter({
  eloMin,
  eloMax,
}: {
  eloMin?: string;
  eloMax?: string;
}) {
  const [minSr, setMinSr] = useState(
    eloMin ? snapSr(Number(eloMin)) : SR_MIN,
  );
  const [maxSr, setMaxSr] = useState(
    eloMax ? snapSr(Number(eloMax)) : SR_MAX,
  );

  function updateMin(raw: number) {
    const next = snapSr(raw);
    setMinSr(next);
    if (next > maxSr) setMaxSr(next);
  }

  function updateMax(raw: number) {
    const next = snapSr(raw);
    setMaxSr(next);
    if (next < minSr) setMinSr(next);
  }

  return (
    <div className="flex flex-wrap items-end gap-4" suppressHydrationWarning>
      <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        SR min
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={minSr}
          onChange={(event) => updateMin(Number(event.target.value))}
          className="accent-orange-400"
          aria-label="SR minimum par palier de 50"
        />
        <input
          name="eloMin"
          type="number"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={minSr}
          onChange={(event) => updateMin(Number(event.target.value))}
          className="hud-input w-28"
        />
      </label>
      <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        SR max
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={maxSr}
          onChange={(event) => updateMax(Number(event.target.value))}
          className="accent-cyan-400"
          aria-label="SR maximum par palier de 50"
        />
        <input
          name="eloMax"
          type="number"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={maxSr}
          onChange={(event) => updateMax(Number(event.target.value))}
          className="hud-input w-28"
        />
      </label>
    </div>
  );
}
