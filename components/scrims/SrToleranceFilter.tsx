"use client";

export function SrToleranceFilter({
  tolerance,
  estimatedSr,
  min,
  max,
  pending,
  onToleranceChange,
}: {
  tolerance: number;
  estimatedSr: number;
  min: number;
  max: number;
  pending?: boolean;
  onToleranceChange: (value: number) => void;
}) {
  const liveLabel =
    estimatedSr > 0
      ? `+/- ${tolerance} SR (Tranche : ${min} – ${max})`
      : `+/- ${tolerance} SR`;

  return (
    <div className="hud-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        Tolérance de SR
        <input
          type="range"
          min={0}
          max={500}
          step={50}
          value={tolerance}
          onChange={(event) => onToleranceChange(Number(event.target.value))}
          className="w-full accent-orange-400"
          aria-valuetext={liveLabel}
        />
      </label>
      <p className="min-w-[16rem] text-sm text-zinc-200">
        {estimatedSr > 0
          ? liveLabel
          : "Définis d'abord le SR estimé de l'équipe"}
        {pending ? (
          <span className="ml-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan-400">
            MAJ…
          </span>
        ) : null}
      </p>
    </div>
  );
}
