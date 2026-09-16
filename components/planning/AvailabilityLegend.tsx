import { DAY_AVAILABILITIES } from "@/lib/availability";

export function AvailabilityLegend() {
  return (
    <ul className="flex flex-wrap gap-2">
      {DAY_AVAILABILITIES.map((item) => (
        <li
          key={item.value}
          className={`rounded-full border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${item.cellClass}`}
        >
          {item.hint}
        </li>
      ))}
      <li className="rounded-full border border-zinc-600 bg-zinc-800/80 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-400">
        Non renseigné
      </li>
    </ul>
  );
}
