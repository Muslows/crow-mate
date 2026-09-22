export function LaneGlyph({
  lane,
  className = "h-4 w-4",
}: {
  lane: "TANK" | "DPS" | "SUPPORT";
  className?: string;
}) {
  if (lane === "TANK") {
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden>
        <path
          fill="currentColor"
          d="M8 1.5 14 4v4.2c0 3.3-2.5 5.6-6 6.8-3.5-1.2-6-3.5-6-6.8V4l6-2.5Z"
        />
      </svg>
    );
  }
  if (lane === "DPS") {
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden>
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path fill="currentColor" d="M7 1h2v5h5v2H9v7H7V8H2V6h5V1Z" />
    </svg>
  );
}

export function RoleLaneStrip() {
  return (
    <div className="flex items-center gap-3 text-violet-700 dark:text-violet-300">
      <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
        <LaneGlyph lane="TANK" /> Tank
      </span>
      <span className="h-3 w-px rotate-12 bg-orange-400/80" />
      <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
        <LaneGlyph lane="DPS" /> Dps
      </span>
      <span className="h-3 w-px rotate-12 bg-orange-400/80" />
      <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
        <LaneGlyph lane="SUPPORT" /> Support
      </span>
    </div>
  );
}
