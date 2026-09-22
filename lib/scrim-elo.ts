import type { PlayerRole } from "@prisma/client";

export type ScrimEloLane = "TANK" | "DPS" | "SUPPORT";

export function playerRoleLane(role: PlayerRole): ScrimEloLane {
  if (role === "TANK") return "TANK";
  if (role === "DPS_HITSCAN" || role === "DPS_FLEX") return "DPS";
  return "SUPPORT";
}

export function scrimEloField(
  role: PlayerRole,
): "scrimEloTank" | "scrimEloDps" | "scrimEloSupport" {
  const lane = playerRoleLane(role);
  if (lane === "TANK") return "scrimEloTank";
  if (lane === "DPS") return "scrimEloDps";
  return "scrimEloSupport";
}

export function scrimEloOf(
  profile: {
    sr: number;
    scrimEloTank?: number | null;
    scrimEloDps?: number | null;
    scrimEloSupport?: number | null;
  },
  role: PlayerRole,
): number {
  const field = scrimEloField(role);
  const value = profile[field] ?? 0;
  return value > 0 ? value : profile.sr;
}
