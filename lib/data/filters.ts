import type { Platform, PlayerRole } from "@prisma/client";
import { PLAYER_ROLES, PLATFORMS } from "@/lib/constants";
import { eloSearchBand, snapSensitivity, snapSr, SR_MAX, SR_MIN } from "@/lib/rank";

const platformValues = new Set<string>(PLATFORMS.map((item) => item.value));
const playRoleValues = new Set<string>(PLAYER_ROLES.map((item) => item.value));

export type OpenPlayRole = PlayerRole;

export function parsePlatformParam(value?: string): Platform | undefined {
  if (!value || !platformValues.has(value)) return undefined;
  return value as Platform;
}

export function parseEloBound(value?: string): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (parsed < SR_MIN || parsed > SR_MAX) return undefined;
  return snapSr(parsed);
}

export function parseSensitivity(value?: string): number {
  if (!value || !/^\d+$/.test(value)) return 100;
  return snapSensitivity(Number.parseInt(value, 10));
}

export function parseEloSearchBand(
  elo?: string,
  sensitivity?: string,
): { min: number; max: number } | undefined {
  const target = parseEloBound(elo);
  if (target === undefined) return undefined;
  return eloSearchBand(target, parseSensitivity(sensitivity));
}

function parseParamList(value?: string | string[]): string[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function parseOpenPlayParams(
  value?: string | string[],
): OpenPlayRole[] {
  const unique = new Set<OpenPlayRole>();
  for (const item of parseParamList(value)) {
    if (playRoleValues.has(item)) unique.add(item as OpenPlayRole);
  }
  return [...unique];
}

export function openPlayWhere(roles: OpenPlayRole[]) {
  if (roles.length === 0) return [];
  return [{ openToPlay: { hasSome: roles } }];
}
