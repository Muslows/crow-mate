import type { Platform } from "@prisma/client";
import { PLATFORMS } from "@/lib/constants";
import { SR_MAX, SR_MIN, snapSr } from "@/lib/rank";

const platformValues = new Set<string>(PLATFORMS.map((item) => item.value));

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
