export function TeamMark({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center border border-orange-400/50 bg-gradient-to-br from-orange-400/25 via-black to-cyan-400/20 font-mono text-lg tracking-[0.12em] text-orange-100 shadow-[0_0_24px_rgba(255,154,31,0.18)]"
    >
      {initials || "OW"}
    </span>
  );
}
