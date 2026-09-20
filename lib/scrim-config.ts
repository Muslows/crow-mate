import type {
  OfficialScrimSlot,
  ScrimLobbyHostPref,
  ScrimMapPool,
} from "@prisma/client";
import { labelFor, SCRIM_LOBBY_HOSTS, SCRIM_MAP_POOLS } from "@/lib/constants";
import {
  encodeMatchSlot,
  formatMatchSlot,
  isMatchableSlot,
} from "@/lib/scrim-slots";
import { WEEKDAY_KEYS, type WeekdayKey, isMondayIso, utcDateToIso, weekDays } from "@/lib/week";

export type TeamScrimConfigValues = {
  discordManager: string;
  battleTagContact: string;
  stagger: boolean;
  povStream: boolean;
  mapPool: ScrimMapPool;
  lobbyHost: ScrimLobbyHostPref;
};

export const emptyScrimConfig: TeamScrimConfigValues = {
  discordManager: "",
  battleTagContact: "",
  stagger: false,
  povStream: false,
  mapPool: "OFFICIEL",
  lobbyHost: "PEU_IMPORTE",
};

export function mapPoolLabel(value: ScrimMapPool): string {
  return labelFor(SCRIM_MAP_POOLS, value);
}

export function lobbyHostLabel(value: ScrimLobbyHostPref): string {
  return labelFor(SCRIM_LOBBY_HOSTS, value);
}

export function acceptedScrimWhen(
  weekStartDate: Date,
  weekday: string,
  slot: OfficialScrimSlot,
): Date {
  const weekIso = utcDateToIso(weekStartDate);
  if (!isMondayIso(weekIso)) return weekStartDate;
  const index = WEEKDAY_KEYS.indexOf(weekday as WeekdayKey);
  const days = weekDays(weekIso);
  const dayIso = days[index >= 0 ? index : 0]?.iso ?? weekIso;
  const hour = slot === "SCRIM_21H" ? 21 : 20;
  return new Date(`${dayIso}T${String(hour).padStart(2, "0")}:00:00.000Z`);
}

export function acceptedScrimLabel(
  weekday: string,
  slot: OfficialScrimSlot,
): string {
  if (!WEEKDAY_KEYS.includes(weekday as WeekdayKey) || !isMatchableSlot(slot)) {
    return weekday;
  }
  return formatMatchSlot(encodeMatchSlot(weekday as WeekdayKey, slot));
}
