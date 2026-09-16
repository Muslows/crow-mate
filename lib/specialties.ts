import type { PlayerRole } from "@prisma/client";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";

export function openPlayBadges(roles: readonly PlayerRole[] | null | undefined): string[] {
  return (roles ?? []).map((role) => labelFor(PLAYER_ROLES, role));
}

export function defaultRosterRole(
  openToPlay: readonly PlayerRole[] | null | undefined,
  fallback: PlayerRole = "TANK",
): PlayerRole {
  return openToPlay?.[0] ?? fallback;
}
