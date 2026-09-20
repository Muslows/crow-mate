import {
  WEEKDAY_KEYS,
  WEEK_TIME_ZONE,
  addCivilDays,
  type CivilDate,
  type WeekdayKey,
  weekSnapshot,
} from "@/lib/week";

export const LFS_REGIONS = ["EU", "NA", "ASIA"] as const;
export const LFS_PLATFORMS = ["PC", "CONSOLE"] as const;
export const LFS_START_HOURS = [20, 21] as const;
export const LFS_DURATION_HOURS = 2;

export type LfsRegion = (typeof LFS_REGIONS)[number];
export type LfsPlatform = (typeof LFS_PLATFORMS)[number];
export type LfsStartHour = (typeof LFS_START_HOURS)[number];

export const WEEKDAY_EN: Record<WeekdayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const WEEKDAY_FR: Record<WeekdayKey, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export function formatSrAsK(sr: number): string {
  const rounded = Math.round(Math.max(0, sr) / 100) * 100;
  if (rounded % 1000 === 0) return `${rounded / 1000}k`;
  return `${(rounded / 1000).toFixed(1)}k`;
}

export function zonedCivilToUtc(
  date: CivilDate,
  hour: number,
  timeZone = WEEK_TIME_ZONE,
): Date {
  let guess = Date.UTC(date.year, date.month - 1, date.day, hour, 0, 0);
  for (let index = 0; index < 4; index += 1) {
    const instant = new Date(guess);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(instant);
    const read = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? "0");
    const asUtc = Date.UTC(
      read("year"),
      read("month") - 1,
      read("day"),
      read("hour"),
      read("minute"),
    );
    const wanted = Date.UTC(date.year, date.month - 1, date.day, hour, 0);
    const delta = wanted - asUtc;
    if (delta === 0) return instant;
    guess += delta;
  }
  return new Date(guess);
}

export function timeZoneAbbr(
  instant: Date,
  timeZone = WEEK_TIME_ZONE,
): string {
  const value =
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "short",
    })
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value ?? "CEST";
  if (value === "GMT+2") return "CEST";
  if (value === "GMT+1") return "CET";
  return value;
}

export function nextSlotEnd(
  weekday: WeekdayKey,
  endHour: number,
  now = new Date(),
): Date {
  const snapshot = weekSnapshot(now);
  const targetIndex = WEEKDAY_KEYS.indexOf(weekday);
  let daysAhead = targetIndex - snapshot.weekdayIndex;
  const todayEnd = zonedCivilToUtc(snapshot.today, endHour);
  if (daysAhead < 0 || (daysAhead === 0 && now.getTime() >= todayEnd.getTime())) {
    daysAhead += 7;
  }
  return zonedCivilToUtc(addCivilDays(snapshot.today, daysAhead), endHour);
}

export function formatLfsHeadline(input: {
  region: LfsRegion;
  platform: LfsPlatform;
  estimatedSr: number;
  weekday: WeekdayKey;
  startHour: number;
  endHour: number;
  timeZoneName: string;
}): string {
  return `LFS ${input.region} ${input.platform} ${formatSrAsK(input.estimatedSr)} ${WEEKDAY_EN[input.weekday]} ${input.startHour}h - ${input.endHour}h ${input.timeZoneName}`;
}

export function lfsHeadlineForSelection(input: {
  region: LfsRegion;
  platform: LfsPlatform;
  estimatedSr: number;
  weekday: WeekdayKey;
  startHour: number;
  now?: Date;
}): { headline: string; expiresAt: Date; endHour: number; timeZoneName: string } {
  const endHour = input.startHour + LFS_DURATION_HOURS;
  const expiresAt = nextSlotEnd(input.weekday, endHour, input.now);
  const timeZoneName = timeZoneAbbr(expiresAt);
  return {
    headline: formatLfsHeadline({
      ...input,
      endHour,
      timeZoneName,
    }),
    expiresAt,
    endHour,
    timeZoneName,
  };
}
