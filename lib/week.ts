export const WEEK_TIME_ZONE = "Europe/Paris";

export const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type CivilDate = {
  year: number;
  month: number;
  day: number;
};

export type WeekSnapshot = {
  today: CivilDate;
  weekdayIndex: number;
  isSunday: boolean;
  currentStart: CivilDate;
  nextStart: CivilDate;
};

function partValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function civilDateInTimeZone(
  instant: Date,
  timeZone = WEEK_TIME_ZONE,
): CivilDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  return {
    year: Number(partValue(parts, "year")),
    month: Number(partValue(parts, "month")),
    day: Number(partValue(parts, "day")),
  };
}

export function weekdayIndexMondayFirst(
  instant: Date,
  timeZone = WEEK_TIME_ZONE,
): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(instant);
  const index = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    weekday,
  );
  if (index < 0) {
    throw new Error(`Unsupported weekday token: ${weekday}`);
  }
  return index;
}

export function addCivilDays(date: CivilDate, days: number): CivilDate {
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function civilToIso(date: CivilDate): string {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${date.year}-${month}-${day}`;
}

export function parseIsoDate(value: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function isoToUtcDate(iso: string): Date {
  const parsed = parseIsoDate(iso);
  if (!parsed) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
}

export function utcDateToIso(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function isMondayIso(iso: string): boolean {
  const parsed = parseIsoDate(iso);
  if (!parsed) return false;
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay() === 1;
}

export function weekSnapshot(
  now: Date = new Date(),
  timeZone = WEEK_TIME_ZONE,
): WeekSnapshot {
  const today = civilDateInTimeZone(now, timeZone);
  const weekdayIndex = weekdayIndexMondayFirst(now, timeZone);
  const currentStart = addCivilDays(today, -weekdayIndex);
  return {
    today,
    weekdayIndex,
    isSunday: weekdayIndex === 6,
    currentStart,
    nextStart: addCivilDays(currentStart, 7),
  };
}

export function allowedWeekStarts(now: Date = new Date()): [string, string] {
  const snapshot = weekSnapshot(now);
  return [civilToIso(snapshot.currentStart), civilToIso(snapshot.nextStart)];
}

export function parseWeekOffset(raw: string | undefined, now: Date = new Date()): 0 | 1 {
  if (raw === "1") return 1;
  if (raw === "0") return 0;
  return weekSnapshot(now).isSunday ? 1 : 0;
}

export function weekStartForOffset(offset: 0 | 1, now: Date = new Date()): string {
  const [current, next] = allowedWeekStarts(now);
  return offset === 1 ? next : current;
}

export function weekDays(weekStartIso: string): { key: WeekdayKey; iso: string }[] {
  const start = parseIsoDate(weekStartIso);
  if (!start || !isMondayIso(weekStartIso)) {
    throw new Error(`Week start must be a Monday ISO date: ${weekStartIso}`);
  }
  return WEEKDAY_KEYS.map((key, index) => ({
    key,
    iso: civilToIso(addCivilDays(start, index)),
  }));
}

export function formatDayHeading(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00.000Z`));
}

export function formatWeekRange(weekStartIso: string): string {
  const days = weekDays(weekStartIso);
  const start = days[0]?.iso;
  const end = days[6]?.iso;
  if (!start || !end) return weekStartIso;
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${fmt.format(new Date(`${start}T12:00:00.000Z`))} – ${fmt.format(new Date(`${end}T12:00:00.000Z`))}`;
}
