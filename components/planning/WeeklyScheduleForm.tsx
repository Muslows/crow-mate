"use client";

import { useActionState, useMemo, useState } from "react";
import { saveWeeklyAvailability } from "@/lib/actions/availability";
import { WEEKDAY_SLOT_FIELDS, type DaySlotMap } from "@/lib/availability";
import {
  emptyActionState,
  type ActionState,
} from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

type DayColumn = {
  key: WeekdayKey;
  label: string;
};

export type PlanningSlotOption = {
  id: string;
  label: string;
};

export function WeeklyScheduleForm({
  weekStartDate,
  days,
  slots,
  columns,
  previousCopied,
}: {
  weekStartDate: string;
  days: DaySlotMap;
  slots: PlanningSlotOption[];
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

  function toggle(day: WeekdayKey, slotId: string) {
    setSelection((current) => {
      const list = current[day] ?? [];
      const next = list.includes(slotId)
        ? list.filter((id) => id !== slotId)
        : [...list, slotId];
      return { ...current, [day]: next };
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="weekStartDate" value={weekStartDate} />
      {WEEKDAY_KEYS.flatMap((key) =>
        (selection[key] ?? []).map((slotId) => (
          <input
            key={`${key}-${slotId}`}
            type="hidden"
            name={WEEKDAY_SLOT_FIELDS[key]}
            value={slotId}
          />
        )),
      )}
      {previousCopied ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Pré-rempli avec tes dernières dispos. Coche un ou plusieurs créneaux
          par jour, puis enregistre.
        </p>
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Coche tous les créneaux où tu es disponible. Plusieurs créneaux par
          jour sont possibles.
        </p>
      )}
      {slots.length === 0 ? (
        <p className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
          Ton équipe n’a pas encore défini de créneaux. Demande au manager de
          les configurer dans les paramètres d’équipe.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {WEEKDAY_KEYS.map((key) => {
            const column = columnsByKey.get(key);
            return (
              <fieldset
                key={key}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3"
              >
                <legend className="px-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-violet-800 dark:text-violet-300">
                  {column?.label ?? key}
                </legend>
                <div className="flex flex-col gap-1.5">
                  {slots.map((slot) => {
                    const checked = (selection[key] ?? []).includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        data-checked={checked}
                        aria-pressed={checked}
                        onClick={() => toggle(key, slot.id)}
                        className={`w-full rounded-lg border px-2 py-1.5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${
                          checked
                            ? "border-violet-600 bg-violet-50 text-violet-950 ring-2 ring-violet-400 dark:border-violet-400 dark:bg-violet-950/50 dark:text-violet-100 dark:ring-violet-500"
                            : "border-zinc-300 bg-zinc-50 text-zinc-600 opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          pending={pending}
          idleLabel="Enregistrer le planning"
          pendingLabel="Enregistrement…"
        />
        {state.message ? (
          <p
            role="status"
            className={`text-sm ${state.ok ? "text-emerald-700 dark:text-lime-400" : "text-orange-700 dark:text-orange-400"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
