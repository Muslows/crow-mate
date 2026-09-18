import { officialSlotMeta } from "@/lib/availability";
import { WEEKDAY_KEYS, formatDayHeading, weekDays } from "@/lib/week";
import type { OfficialScrimSlot } from "@prisma/client";
import type { WeekdayKey } from "@/lib/week";

export function OfficialScheduleStrip({
  weekStartIso,
  days,
  notes,
}: {
  weekStartIso: string;
  days: Record<WeekdayKey, OfficialScrimSlot>;
  notes?: Record<WeekdayKey, string>;
}) {
  const columns = weekDays(weekStartIso);

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {WEEKDAY_KEYS.map((key, index) => {
        const meta = officialSlotMeta(days[key], notes?.[key] ?? "");
        const iso = columns[index]?.iso;
        return (
          <li
            key={key}
            className={`flex flex-col gap-1 rounded-xl border px-2 py-2 transition-colors duration-200 ${meta.cellClass}`}
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em]">
              {iso ? formatDayHeading(iso) : key}
            </span>
            <span className="text-sm font-semibold uppercase">{meta.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
