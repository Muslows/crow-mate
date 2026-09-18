import { DAY_AVAILABILITIES } from "@/lib/availability";

const DOT: Record<string, string> = {
  DISPO_20H: "bg-emerald-500",
  DISPO_21H: "bg-sky-500",
  INCERTAIN: "bg-amber-400",
  INDISPO: "bg-zinc-400 dark:bg-zinc-500",
};

export function AvailabilityLegend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-400">
      {DAY_AVAILABILITIES.map((item) => (
        <li key={item.value} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${DOT[item.value]}`} />
          {item.hint}
        </li>
      ))}
      <li className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        Non renseigné
      </li>
    </ul>
  );
}
