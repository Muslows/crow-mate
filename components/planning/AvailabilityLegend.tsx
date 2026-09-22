import type { DaySlotMap } from "@/lib/availability";

export function AvailabilityLegend({
  slots,
}: {
  slots: { id: string; label: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-400">
      {slots.map((slot) => (
        <li key={slot.id} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-600 dark:bg-violet-400" />
          {slot.label}
        </li>
      ))}
      <li className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        Aucun créneau
      </li>
    </ul>
  );
}
