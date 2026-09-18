"use client";

import { intensityCaption, SCRIM_INTENSITY_VALUES } from "@/lib/scrim-intensity";
import type { ScrimMapOutcome } from "@prisma/client";

export function IntensityPills({
  name = "intensity",
  outcome,
  value,
  onChange,
}: {
  name?: string;
  outcome: ScrimMapOutcome;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400">
        Intensité
      </legend>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-2">
        {SCRIM_INTENSITY_VALUES.map((level) => {
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`min-w-10 rounded-md border px-3 py-1 font-mono text-sm transition-colors duration-200 ${
                selected
                  ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-400 dark:bg-orange-400/20 dark:text-orange-100"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-orange-300 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-400 dark:hover:border-cyan-300"
              }`}
              aria-pressed={selected}
            >
              {level}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">{intensityCaption(outcome, value)}</p>
    </fieldset>
  );
}
