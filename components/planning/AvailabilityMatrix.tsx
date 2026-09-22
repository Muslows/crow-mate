"use client";

import { memo } from "react";
import type { OfficialScrimSlot, PlayerRole } from "@prisma/client";
import type { WeekdayKey } from "@/lib/week";
import type { ScrimSuggestion } from "@/lib/scrim-suggestion";
import { suggestionBadgeClass } from "@/lib/scrim-suggestion";
import { OfficialScheduleRow } from "@/components/planning/OfficialScheduleRow";
import { RoleBadge } from "@/components/ui/RoleBadge";

export type AvailabilityMatrixRow = {
  rosterId: string;
  name: string;
  role: string;
  days: Record<WeekdayKey, string[]> | null;
};

export type AvailabilityDayColumn = {
  key: WeekdayKey;
  label: string;
};

function AvailabilityCell({
  slotIds,
  slots,
}: {
  slotIds: string[] | null;
  slots: { id: string; label: string }[];
}) {
  const selected = slots.filter((slot) => (slotIds ?? []).includes(slot.id));
  if (selected.length === 0) {
    return (
      <span className="text-[0.65rem] text-zinc-500" title="Aucun créneau">
        —
      </span>
    );
  }
  return (
    <span
      className="inline-flex flex-col items-center gap-1"
      title={selected.map((item) => item.label).join(" · ")}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-violet-600 dark:bg-violet-400" />
      <span className="text-center text-[0.6rem] font-medium text-violet-900 dark:text-violet-200">
        {selected.map((slot) => slot.label).join(" · ")}
      </span>
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
  timeSlots,
}: {
  columns: AvailabilityDayColumn[];
  rows: AvailabilityMatrixRow[];
  suggestions: Record<WeekdayKey, ScrimSuggestion>;
  official: Record<WeekdayKey, OfficialScrimSlot>;
  officialNotes?: Record<WeekdayKey, string>;
  officialEditable?: boolean;
  teamId: string;
  weekStartDate: string;
  timeSlots: { id: string; label: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <div className={`${GRID} min-w-[52rem]`}>
        <div className="hidden px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 lg:block">
          Joueur
        </div>
        {columns.map((column) => (
          <div
            key={column.key}
            className="hidden text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 lg:block"
          >
            {column.label}
          </div>
        ))}

        {rows.length === 0 ? (
          <p className="col-span-full px-3 py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Aucun joueur dans le roster pour cette équipe.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.rosterId} className="contents">
              <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:border-0 lg:bg-transparent">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.name}
                </p>
                <div className="mt-1">
                  <RoleBadge role={row.role as PlayerRole} compact />
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 lg:hidden">
                  {columns.map((column) => (
                    <div key={column.key} className="text-center">
                      <p className="mb-1 text-[0.55rem] uppercase tracking-[0.08em] text-zinc-600 dark:text-zinc-400">
                        {column.label.slice(0, 2)}
                      </p>
                      <AvailabilityCell
                        slotIds={row.days?.[column.key] ?? null}
                        slots={timeSlots}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="hidden items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-1 py-2 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:flex"
                >
                  <AvailabilityCell
                    slotIds={row.days?.[column.key] ?? null}
                    slots={timeSlots}
                  />
                </div>
              ))}
            </div>
          ))
        )}

        <div className="contents">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Suggestion
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Moteur scrims
            </p>
          </div>
          {columns.map((column) => {
            const suggestion = suggestions[column.key];
            return (
              <div
                key={column.key}
                className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-1 py-2 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span
                  className={`inline-flex min-h-10 min-w-[5.5rem] items-center justify-center text-center leading-tight ${suggestionBadgeClass(suggestion.kind)}`}
                  title={`${suggestion.bestCount} joueur(s) sur le meilleur créneau`}
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
      <div className="h-8 w-64 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-2">
          <div className="h-10 w-36 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
          {Array.from({ length: columns }, (_, col) => (
            <div
              key={col}
              className="h-10 flex-1 animate-pulse rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
