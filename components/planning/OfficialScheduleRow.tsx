"use client";

import { useRef, useState, useTransition } from "react";
import { saveOfficialSchedule } from "@/lib/actions/schedule";
import { OFFICIAL_SCRIM_SLOTS, officialSlotMeta } from "@/lib/availability";
import { Spinner } from "@/components/forms/SubmitButton";
import type { OfficialScrimSlot } from "@prisma/client";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

function isOfficialSlot(value: string): value is OfficialScrimSlot {
  return OFFICIAL_SCRIM_SLOTS.some((item) => item.value === value);
}

function compactSlotLabel(slot: OfficialScrimSlot, note: string): string {
  if (slot === "SCRIM_20H") return "20h";
  if (slot === "SCRIM_21H") return "21h";
  if (slot === "VOD_REVIEW") return "VOD";
  if (slot === "TOURNOI") return "🏆";
  if (slot === "CUSTOM") return note.trim() ? "Perso" : "…";
  if (slot === "TBD") return "?";
  return "—";
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
  const [syncByDay, setSyncByDay] = useState<
    Partial<Record<WeekdayKey, "syncing" | "saved" | "error">>
  >({});
  const slotsRef = useRef(slots);
  const notesRef = useRef(draftNotes);
  const requestIdRef = useRef<Partial<Record<WeekdayKey, number>>>({});
  const [, startTransition] = useTransition();

  function persist(
    day: WeekdayKey,
    nextSlots: Record<WeekdayKey, OfficialScrimSlot>,
    nextNotes: Record<WeekdayKey, string>,
    previousSlot: OfficialScrimSlot,
    previousNote: string,
  ) {
    const requestId = (requestIdRef.current[day] ?? 0) + 1;
    requestIdRef.current[day] = requestId;
    slotsRef.current = nextSlots;
    notesRef.current = nextNotes;
    setSlots(nextSlots);
    setDraftNotes(nextNotes);
    setSyncByDay((current) => ({ ...current, [day]: "syncing" }));

    startTransition(async () => {
      const result = await saveOfficialSchedule(
        scheduleFormData(teamId, weekStartDate, nextSlots, nextNotes),
      );
      if (requestIdRef.current[day] !== requestId) return;

      if (!result.ok) {
        const rolledBackSlots = {
          ...slotsRef.current,
          [day]: previousSlot,
        };
        const rolledBackNotes = {
          ...notesRef.current,
          [day]: previousNote,
        };
        slotsRef.current = rolledBackSlots;
        notesRef.current = rolledBackNotes;
        setSlots(rolledBackSlots);
        setDraftNotes(rolledBackNotes);
        setSyncByDay((current) => ({ ...current, [day]: "error" }));
        return;
      }

      setSyncByDay((current) => ({ ...current, [day]: "saved" }));
      window.setTimeout(() => {
        if (requestIdRef.current[day] !== requestId) return;
        setSyncByDay((current) => {
          const next = { ...current };
          delete next[day];
          return next;
        });
      }, 1200);
    });
  }

  return (
    <div className="contents">
      <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 transition-colors duration-200 dark:border-orange-800/70 dark:bg-orange-950/40 lg:sticky lg:left-0 lg:z-10">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Planning manager
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Officiel</p>
        {editable ? (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Enregistrement automatique
          </p>
        ) : null}
      </div>
      {columns.map((column) => {
        const slot = slots[column.key];
        const note = draftNotes[column.key] ?? "";
        const meta = officialSlotMeta(slot, note);
        return (
          <div key={column.key} className="relative flex min-h-16 items-center justify-center rounded-lg border border-zinc-200 bg-white px-1 py-2 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950">
            {editable ? (
              <div className="flex w-full flex-col items-center justify-center gap-1">
                <div
                  className={`relative inline-flex min-h-9 min-w-12 max-w-full items-center justify-center px-2 text-center text-xs font-bold uppercase tracking-[0.08em] ${meta.cellClass}`}
                  title={meta.label}
                >
                  <span aria-hidden>{compactSlotLabel(slot, note)}</span>
                  <select
                    value={slot}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!isOfficialSlot(value)) return;
                      const currentSlots = slotsRef.current;
                      const currentNotes = notesRef.current;
                      const nextSlots = { ...currentSlots, [column.key]: value };
                      const nextNotes = {
                        ...currentNotes,
                        [column.key]: value === "CUSTOM" ? note : "",
                      };
                      if (value === "CUSTOM") {
                        slotsRef.current = nextSlots;
                        notesRef.current = nextNotes;
                        setSlots(nextSlots);
                        setDraftNotes(nextNotes);
                        return;
                      }
                      persist(
                        column.key,
                        nextSlots,
                        nextNotes,
                        slot,
                        note,
                      );
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 bg-transparent text-transparent focus:outline-none dark:bg-transparent dark:text-transparent"
                    aria-label={`Planning validé ${column.label} : ${meta.label}`}
                  >
                    {OFFICIAL_SCRIM_SLOTS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {slot === "CUSTOM" ? (
                  <input
                    type="text"
                    maxLength={50}
                    defaultValue={note}
                    placeholder="Libellé (50 car.)"
                    className="hud-input w-full px-1 py-1 text-center text-[0.65rem]"
                    aria-label={`Événement custom ${column.label}`}
                    onBlur={(event) => {
                      const nextNote = event.target.value.trim().slice(0, 50);
                      if (!nextNote || nextNote === note) return;
                      persist(
                        column.key,
                        slotsRef.current,
                        { ...notesRef.current, [column.key]: nextNote },
                        slot,
                        note,
                      );
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
            {syncByDay[column.key] ? (
              <span
                role="status"
                aria-label={
                  syncByDay[column.key] === "syncing"
                    ? "Synchronisation"
                    : syncByDay[column.key] === "saved"
                      ? "Enregistré"
                      : "Échec de l'enregistrement"
                }
                className={`absolute right-1.5 top-1.5 flex h-3 w-3 items-center justify-center text-[0.6rem] ${
                  syncByDay[column.key] === "error"
                    ? "text-red-500"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {syncByDay[column.key] === "syncing" ? (
                  <Spinner className="h-2.5 w-2.5" />
                ) : syncByDay[column.key] === "saved" ? (
                  "✓"
                ) : (
                  "!"
                )}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
