"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveOfficialSchedule } from "@/lib/actions/schedule";
import { OFFICIAL_SCRIM_SLOTS, officialSlotMeta } from "@/lib/availability";
import {
  emptyActionState,
  type ActionState,
} from "@/lib/actions/state";
import { Spinner } from "@/components/forms/SubmitButton";
import type { OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

function isOfficialSlot(value: string): value is OfficialScrimSlot {
  return OFFICIAL_SCRIM_SLOTS.some((item) => item.value === value);
}

function noteKey(day: WeekdayKey): `${WeekdayKey}Note` {
  return `${day}Note`;
}

function scheduleFormData(
  teamId: string,
  weekStartDate: string,
  slots: Record<WeekdayKey, OfficialScrimSlot>,
  notes: Record<WeekdayKey, string>,
): FormData {
  const formData = new FormData();
  formData.set("teamId", teamId);
  formData.set("weekStartDate", weekStartDate);
  for (const key of WEEKDAY_KEYS) {
    formData.set(key, slots[key]);
    formData.set(noteKey(key), slots[key] === "CUSTOM" ? notes[key] : "");
  }
  return formData;
}

const EMPTY_NOTES: Record<WeekdayKey, string> = {
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
  sunday: "",
};

export function OfficialScheduleRow({
  teamId,
  weekStartDate,
  columns,
  values,
  notes = EMPTY_NOTES,
  editable,
}: {
  teamId: string;
  weekStartDate: string;
  columns: { key: WeekdayKey; label: string }[];
  values: Record<WeekdayKey, OfficialScrimSlot>;
  notes?: Record<WeekdayKey, string>;
  editable: boolean;
}) {
  const [slots, setSlots] = useState(values);
  const [draftNotes, setDraftNotes] = useState(notes);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveOfficialSchedule,
    emptyActionState,
  );
  const toast = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setSlots(values);
    setDraftNotes(notes);
  }, [values, notes, weekStartDate]);

  useEffect(() => {
    if (state.message) toast.current?.focus();
  }, [state]);

  function persist(
    nextSlots: Record<WeekdayKey, OfficialScrimSlot>,
    nextNotes: Record<WeekdayKey, string>,
  ) {
    setSlots(nextSlots);
    setDraftNotes(nextNotes);
    formAction(scheduleFormData(teamId, weekStartDate, nextSlots, nextNotes));
  }

  return (
    <div className="contents">
      <div className="rounded-xl border border-border bg-orange-950/40 px-3 py-3 lg:sticky lg:left-0 lg:z-10">
        <p className="text-sm font-semibold text-foreground">Planning manager</p>
        <p className="text-xs text-zinc-500">Officiel</p>
        {editable ? (
          <p
            ref={toast}
            tabIndex={-1}
            role="status"
            className={`mt-1 text-xs ${
              pending
                ? "text-zinc-500"
                : state.ok
                  ? "text-emerald-700"
                  : state.message
                    ? "text-orange-400"
                    : "text-zinc-500"
            }`}
          >
            {pending ? (
              <span className="inline-flex items-center gap-1">
                <Spinner className="h-3 w-3" />
                Enregistrement…
              </span>
            ) : (
              (state.message ?? "Choisis l'activité officielle")
            )}
          </p>
        ) : null}
      </div>
      {columns.map((column) => {
        const slot = slots[column.key];
        const note = draftNotes[column.key] ?? "";
        const meta = officialSlotMeta(slot, note);
        return (
          <div key={column.key} className="flex items-center justify-center px-1 py-2">
            {editable ? (
              <div className="flex min-w-[7.5rem] flex-col gap-1">
                <select
                  value={slot}
                  disabled={pending}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!isOfficialSlot(value)) return;
                    const nextSlots = { ...slots, [column.key]: value };
                    const nextNotes = {
                      ...draftNotes,
                      [column.key]: value === "CUSTOM" ? note : "",
                    };
                    if (value === "CUSTOM") {
                      setSlots(nextSlots);
                      setDraftNotes(nextNotes);
                      return;
                    }
                    persist(nextSlots, nextNotes);
                  }}
                  className="hud-input px-1 py-1 text-center text-[0.7rem] uppercase tracking-[0.08em]"
                  aria-label={`Planning validé ${column.label}`}
                >
                  {OFFICIAL_SCRIM_SLOTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {slot === "CUSTOM" ? (
                  <input
                    type="text"
                    maxLength={50}
                    disabled={pending}
                    defaultValue={note}
                    placeholder="Libellé (50 car.)"
                    className="hud-input px-1 py-1 text-center text-[0.65rem]"
                    aria-label={`Événement custom ${column.label}`}
                    onBlur={(event) => {
                      const nextNote = event.target.value.trim().slice(0, 50);
                      if (!nextNote || nextNote === note) return;
                      persist(slots, { ...draftNotes, [column.key]: nextNote });
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.currentTarget.blur();
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <span
                className={`inline-flex min-h-9 min-w-[4.5rem] items-center justify-center px-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${meta.cellClass}`}
              >
                {meta.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
