"use client";

import { useState } from "react";
import { RankBadge } from "@/components/ui/RankBadge";
import { SR_MAX, SR_MIN, SR_STEP, rankFromSr, snapSr } from "@/lib/rank";

export function SrField({
  name = "sr",
  defaultValue = 0,
  error,
}: {
  name?: string;
  defaultValue?: number;
  error?: string;
}) {
  const [sr, setSr] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <label className="text-sm uppercase tracking-wider text-zinc-400">
        Élo / SR
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={sr}
          onChange={(event) => setSr(Number(event.target.value))}
          className="min-w-[12rem] flex-1 accent-orange-400"
          aria-label="Curseur SR"
        />
        <input
          name={name}
          type="number"
          min={SR_MIN}
          max={SR_MAX}
          value={sr}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            setSr(snapSr(next));
          }}
          className="hud-input w-28"
          aria-describedby="sr-field-error"
        />
        <RankBadge rank={rankFromSr(sr)} />
      </div>
      {error ? (
        <p id="sr-field-error" role="alert" className="text-sm text-orange-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
