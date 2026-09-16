"use client";

import { availabilityMeta } from "@/lib/availability";
import type { DayAvailability, OfficialScrimSlot } from "@prisma/client";
import { memo } from "react";
import type { WeekdayKey } from "@/lib/week";
import type { ScrimSuggestion } from "@/lib/scrim-suggestion";
import { suggestionBadgeClass } from "@/lib/scrim-suggestion";
import { OfficialScheduleRow } from "@/components/planning/OfficialScheduleRow";
import { RoleBadge } from "@/components/ui/RoleBadge";
import type { PlayerRole } from "@prisma/client";

export type AvailabilityMatrixRow = {
  rosterId: string;
  name: string;
  role: string;
  days: Record<WeekdayKey, DayAvailability> | null;
};

export type AvailabilityDayColumn = {
  key: WeekdayKey;
  label: string;
};

function AvailabilityCell({
  value,
}: {
  value: DayAvailability | null;
}) {
  const meta = availabilityMeta(value);
  return (
    <span
      className={`inline-flex min-h-9 min-w-[4.25rem] items-center justify-center px-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition ${meta.cellClass}`}
      title={meta.hint}
    >
      {meta.label}
    </span>
  );
}

const GRID =
  "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(11rem,14rem)_repeat(7,minmax(5.5rem,1fr))] lg:gap-2";

export const AvailabilityMatrix = memo(function AvailabilityMatrix({
  columns,
  rows,
  suggestions,
  official,
  officialNotes,
  officialEditable = false,
  teamId,
  weekStartDate,
}: {
  columns: AvailabilityDayColumn[];
  rows: AvailabilityMatrixRow[];
  suggestions: Record<WeekdayKey, ScrimSuggestion>;
  official: Record<WeekdayKey, OfficialScrimSlot>;
  officialNotes?: Record<WeekdayKey, string>;
  officialEditable?: boolean;
  teamId: string;
  weekStartDate: string;
}) {
  return (
    <div className="overflow-x-auto">
      <div className={`${GRID} min-w-[52rem]`}>
        <div className="hidden px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 lg:block">
          Joueur
        </div>
        {columns.map((column) => (
          <div
            key={column.key}
            className="hidden text-center text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cyan-300 lg:block"
          >
            {column.label}
          </div>
        ))}

        {rows.length === 0 ? (
          <p className="col-span-full px-3 py-4 text-sm text-zinc-400">
            Aucun joueur dans le roster pour cette équipe.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.rosterId} className="contents">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 lg:border-0 lg:bg-transparent">
                <p className="text-sm font-semibold uppercase text-cyan-100">
                  {row.name}
                </p>
                <div className="mt-1">
                  <RoleBadge role={row.role as PlayerRole} compact />
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 lg:hidden">
                  {columns.map((column) => (
                    <div key={column.key} className="text-center">
                      <p className="mb-1 text-[0.55rem] uppercase tracking-[0.08em] text-zinc-500">
                        {column.label.slice(0, 2)}
                      </p>
                      <AvailabilityCell value={row.days?.[column.key] ?? null} />
                    </div>
                  ))}
                </div>
              </div>
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="hidden items-center justify-center lg:flex"
                >
                  <AvailabilityCell value={row.days?.[column.key] ?? null} />
                </div>
              ))}
            </div>
          ))
        )}

        <div className="contents">
          <div className="rounded-xl bg-cyan-400/10 px-3 py-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">
              Suggestion du Système
            </p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Moteur scrims
            </p>
          </div>
          {columns.map((column) => {
            const suggestion = suggestions[column.key];
            return (
              <div key={column.key} className="flex items-center justify-center px-1 py-2">
                <span
                  className={`inline-flex min-h-12 min-w-[6.5rem] items-center justify-center px-2 text-center text-[0.62rem] font-semibold leading-tight tracking-[0.04em] ${suggestionBadgeClass(suggestion.kind)}`}
                  title={`${suggestion.availableAt20} dispo 20h · ${suggestion.availableAt21} dispo 21h`}
                >
                  {suggestion.label}
                </span>
              </div>
            );
          })}
        </div>

        <OfficialScheduleRow
          key={weekStartDate}
          teamId={teamId}
          weekStartDate={weekStartDate}
          columns={columns}
          values={official}
          notes={officialNotes}
          editable={officialEditable}
        />
      </div>
    </div>
  );
});

export function AvailabilityMatrixSkeleton({
  columns = 7,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
      <div className="h-8 w-64 animate-pulse rounded-xl border border-white/10 bg-white/5" />
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-2">
          <div className="h-10 w-36 animate-pulse rounded-xl border border-white/10 bg-white/5" />
          {Array.from({ length: columns }, (_, col) => (
            <div
              key={col}
              className="h-10 flex-1 animate-pulse rounded-full border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
