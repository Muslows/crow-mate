export type ClockRange = {
  startMinutes: number;
  endMinutes: number;
};

export const DEFAULT_TEAM_TIME_SLOTS = [
  { label: "20h - 22h", startTime: "20:00", endTime: "22:00" },
  { label: "21h - 23h", startTime: "21:00", endTime: "23:00" },
] as const;

export function parseClockToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (!Number.isInteger(hours) || hours < 0 || hours > 24) return null;
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) return null;
  if (hours === 24 && minutes !== 0) return null;
  return Math.min(24 * 60, hours * 60 + minutes);
}

export function formatMinutesAsClock(total: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.trunc(total)));
  if (clamped === 24 * 60) return "00:00";
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatSlotLabel(startTime: string, endTime: string): string {
  const start = parseClockToMinutes(startTime);
  const end = parseClockToMinutes(endTime);
  if (start === null || end === null) return `${startTime} – ${endTime}`;
  const startLabel = `${Math.floor(start / 60)}h${start % 60 ? String(start % 60).padStart(2, "0") : ""}`;
  const endNorm = end === 0 ? 24 * 60 : end;
  const endLabel = `${Math.floor(endNorm / 60) % 24}h${endNorm % 60 ? String(endNorm % 60).padStart(2, "0") : ""}`;
  return `${startLabel} - ${endLabel}`;
}

export function rangeFromClock(
  startTime: string,
  endTime: string,
): ClockRange | null {
  const startMinutes = parseClockToMinutes(startTime);
  const rawEnd = parseClockToMinutes(endTime);
  if (startMinutes === null || rawEnd === null) return null;
  let endMinutes = rawEnd;
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return { startMinutes, endMinutes };
}

export function windowKey(startMinutes: number, endMinutes: number): string {
  return `${startMinutes}-${endMinutes}`;
}

export function parseWindowKey(
  value: string,
): ClockRange | null {
  const match = value.match(/^(\d{1,4})-(\d{1,4})$/);
  if (!match) return null;
  const startMinutes = Number(match[1]);
  const endMinutes = Number(match[2]);
  if (endMinutes <= startMinutes) return null;
  return { startMinutes, endMinutes };
}

export function rangesOverlap(left: ClockRange, right: ClockRange): boolean {
  return left.startMinutes < right.endMinutes && right.startMinutes < left.endMinutes;
}
