import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "orange" | "green" | "muted";
}) {
  const tones = {
    cyan: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
    orange:
      "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200",
    green:
      "border-lime-200 bg-lime-50 text-lime-800 dark:border-lime-800 dark:bg-lime-950/50 dark:text-lime-200",
    muted:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-border dark:bg-zinc-800/50 dark:text-zinc-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium transition-colors duration-200 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
