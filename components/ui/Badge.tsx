import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "orange" | "green" | "muted";
}) {
  const tones = {
    cyan: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
    orange: "border-orange-400/50 bg-orange-400/10 text-orange-200",
    green: "border-lime-400/40 bg-lime-400/10 text-lime-200",
    muted: "border-white/10 bg-white/5 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
