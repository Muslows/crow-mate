"use client";

import { useState } from "react";
import {
  SENSITIVITY_MAX,
  SENSITIVITY_MIN,
  SENSITIVITY_STEP,
  SR_MAX,
  SR_MIN,
  SR_STEP,
  eloSearchBand,
  snapSensitivity,
  snapSr,
} from "@/lib/rank";

type EloBand = { elo: number; sensitivity: number };

export function EloBandFilter({
  elo,
  sensitivity,
  onChange,
}: {
  elo?: string;
  sensitivity?: string;
  onChange?: (next: EloBand) => void;
}) {
  const [target, setTarget] = useState(elo ? snapSr(Number(elo)) : 2000);
  const [range, setRange] = useState(
    sensitivity ? snapSensitivity(Number(sensitivity)) : 100,
  );
  const band = eloSearchBand(target, range);

  function commit(next: EloBand) {
    setTarget(next.elo);
    setRange(next.sensitivity);
    onChange?.(next);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Élo cible
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={String(target)}
          onChange={(event) =>
            commit({
              elo: snapSr(Number(event.target.value)),
              sensitivity: range,
            })
          }
          className="accent-orange-400"
          aria-label="Élo cible par palier de 50"
        />
        <input
          name="elo"
          type="number"
          min={SR_MIN}
          max={SR_MAX}
          step={SR_STEP}
          value={String(target)}
          onChange={(event) =>
            commit({
              elo: snapSr(Number(event.target.value)),
              sensitivity: range,
            })
          }
          className="hud-input w-28"
        />
      </label>
      <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Sensibilité (±)
        <input
          type="range"
          min={SENSITIVITY_MIN}
          max={SENSITIVITY_MAX}
          step={SENSITIVITY_STEP}
          value={String(range)}
          onChange={(event) =>
            commit({
              elo: target,
              sensitivity: snapSensitivity(Number(event.target.value)),
            })
          }
          className="accent-cyan-400"
          aria-label="Sensibilité de 0 à 300"
        />
        <input
          name="sensitivity"
          type="number"
          min={SENSITIVITY_MIN}
          max={SENSITIVITY_MAX}
          step={SENSITIVITY_STEP}
          value={String(range)}
          onChange={(event) =>
            commit({
              elo: target,
              sensitivity: snapSensitivity(Number(event.target.value)),
            })
          }
          className="hud-input w-28"
        />
      </label>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-400">
        Tranche {band.min}–{band.max} SR
      </p>
    </div>
  );
}
