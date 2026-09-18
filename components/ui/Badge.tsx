import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "orange" | "green" | "muted";
}) {
  const tones = {
    cyan: "border-sky-800 bg-sky-950/50 text-sky-200",
    orange: "border-orange-800/70 bg-orange-950/40 text-orange-200",
    green: "border-lime-800 bg-lime-950/50 text-lime-200",
    muted: "border-border bg-zinc-800/50 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
