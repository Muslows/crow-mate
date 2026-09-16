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
      <legend className="text-xs uppercase tracking-[0.14em] text-zinc-500">
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
              className={`min-w-10 border px-3 py-1 font-mono text-sm ${
                selected
                  ? "border-orange-400 bg-orange-400/20 text-orange-100"
                  : "border-cyan-400/25 text-zinc-400 hover:border-cyan-300"
              }`}
              aria-pressed={selected}
            >
              {level}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-400">{intensityCaption(outcome, value)}</p>
    </fieldset>
  );
}
