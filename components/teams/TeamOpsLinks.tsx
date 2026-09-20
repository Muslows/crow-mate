import Link from "next/link";

export function TeamOpsLinks({
  teamId,
  current,
}: {
  teamId: string;
  current?: "roster" | "planning" | "scrims" | "matches" | "config" | "find";
}) {
  const items = [
    { href: `/manage/teams/${teamId}/edit`, label: "Roster", key: "roster" as const },
    { href: `/manage/teams/${teamId}/planning`, label: "Planning", key: "planning" as const },
    { href: `/manage/teams/${teamId}/scrims`, label: "Scrims", key: "scrims" as const },
    {
      href: `/manage/teams/${teamId}/matches`,
      label: "Scrims validés",
      key: "matches" as const,
    },
    { href: `/manage/teams/${teamId}/scrim-config`, label: "Configuration de Scrim", key: "config" as const },
    { href: `/manage/teams/${teamId}/find`, label: "Trouver un scrim", key: "find" as const },
  ];

  return (
    <nav
      aria-label="Opérations équipe"
      className="flex flex-wrap gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-surface/5"
    >
      {items.map((item) =>
        item.key === current ? (
          <span
            key={item.key}
            className="rounded-full bg-orange-400 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-black"
          >
            {item.label}
          </span>
        ) : (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-full px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-600 transition hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-200"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
