"use client";

import { useActionState, useMemo, useState } from "react";
import { saveWeeklyAvailability } from "@/lib/actions/availability";
import { DAY_AVAILABILITIES } from "@/lib/availability";
import {
  emptyActionState,
  type ActionState,
} from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";
import type { DayAvailability } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

type DayColumn = {
  key: WeekdayKey;
  label: string;
};

export function WeeklyScheduleForm({
  weekStartDate,
  days,
  columns,
  previousCopied,
}: {
  weekStartDate: string;
  days: Record<WeekdayKey, DayAvailability>;
  columns: DayColumn[];
  previousCopied: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveWeeklyAvailability,
    emptyActionState,
  );
  const [selection, setSelection] = useState(days);
  const columnsByKey = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="weekStartDate" value={weekStartDate} />
      {WEEKDAY_KEYS.map((key) => (
        <input key={key} type="hidden" name={key} value={selection[key]} />
      ))}
      {previousCopied ? (
        <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          Pré-rempli avec tes dernières dispos. Ajuste puis enregistre.
        </p>
      ) : (
        <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          Par défaut tout est indisponible : choisis un état pour chaque jour.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {WEEKDAY_KEYS.map((key) => {
          const column = columnsByKey.get(key);
          return (
            <fieldset
              key={key}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <legend className="px-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
                {column?.label ?? key}
              </legend>
              <div className="flex flex-col gap-1.5">
                {DAY_AVAILABILITIES.map((option) => {
                  const checked = selection[key] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      data-checked={checked}
                      aria-pressed={checked}
                      onClick={() =>
                        setSelection((current) => ({
                          ...current,
                          [key]: option.value,
                        }))
                      }
                      className={`w-full rounded-full border px-2 py-1.5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${option.chipClass} ${
                        checked ? "opacity-100 scale-[1.02]" : "opacity-45"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          pending={pending}
          idleLabel="Enregistrer le planning"
          pendingLabel="Enregistrement…"
        />
        {state.message ? (
          <p
            role="status"
            className={`text-sm ${state.ok ? "text-lime-700 dark:text-lime-400" : "text-orange-600 dark:text-orange-400"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
