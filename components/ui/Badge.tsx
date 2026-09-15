import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "orange" | "green" | "muted";
}) {
  const tones = {
    cyan: "border-cyan-400/50 text-cyan-300",
    orange: "border-orange-400/60 text-orange-300",
    green: "border-lime-400/50 text-lime-300",
    muted: "border-zinc-500/50 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
