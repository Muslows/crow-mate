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
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-lg font-bold tracking-tight text-orange-800 transition-colors duration-200 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-200"
    >
      {initials || "OW"}
    </span>
  );
}
