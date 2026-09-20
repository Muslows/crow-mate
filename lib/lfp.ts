import type { PlayerRole } from "@prisma/client";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";
import { formatSrAsK } from "@/lib/lfs";

export const LFP_TTL_HOURS = 72;
export const OPEN_POSITION_SR_TOLERANCE = 200;

export const LFP_ROLE_EN: Record<PlayerRole, string> = {
  TANK: "Tank",
  DPS_HITSCAN: "Hitscan",
  DPS_FLEX: "Flex DPS",
  MAIN_SUPPORT: "Main Support",
  FLEX_SUPPORT: "Flex Support",
};

export function formatLfpHeadline(input: {
  platform: string;
  estimatedSr: number;
  role: PlayerRole;
}): string {
  const platform = input.platform === "CONSOLE" ? "CONSOLE" : "PC";
  return `LFP ${platform} ${formatSrAsK(input.estimatedSr)} ${LFP_ROLE_EN[input.role]}`;
}

export function openPositionApplyMessage(role: PlayerRole): string {
  return `Bonjour, je suis intéressé par votre poste de ${labelFor(PLAYER_ROLES, role)}. Mon profil correspond à vos critères de niveau et de langue !`;
}
