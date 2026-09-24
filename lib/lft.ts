import type { PlayerRole } from "@prisma/client";
import { LFP_ROLE_EN } from "@/lib/lfp";
import {
  LFS_PLATFORMS,
  LFS_REGIONS,
  formatSrAsK,
  WEEKDAY_EN,
  type LfsPlatform,
  type LfsRegion,
} from "@/lib/lfs";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export const LFT_TTL_HOURS = 72;
export const LFT_DESCRIPTION_MAX = 400;
export const LFT_REGIONS = LFS_REGIONS;
export const LFT_PLATFORMS = LFS_PLATFORMS;

export function formatLftHeadline(input: {
  region: LfsRegion;
  platform: LfsPlatform;
  estimatedSr: number;
  weekdays: WeekdayKey[];
  startHour: number;
  endHour: number;
  role: PlayerRole;
}): string {
  const days = (input.weekdays.length > 0 ? input.weekdays : (["monday", "tuesday"] as WeekdayKey[]))
    .filter((day, index, list) => WEEKDAY_KEYS.includes(day) && list.indexOf(day) === index)
    .map((day) => WEEKDAY_EN[day])
    .join("/");
  return `LFT ${input.region} ${input.platform} ${formatSrAsK(input.estimatedSr)} ${days} ${input.startHour}h-${input.endHour}h ${LFP_ROLE_EN[input.role]}`;
}
