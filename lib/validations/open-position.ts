import { z } from "zod";

const playerRoles = [
  "TANK",
  "DPS_HITSCAN",
  "DPS_FLEX",
  "MAIN_SUPPORT",
  "FLEX_SUPPORT",
] as const;

export const addOpenPositionSchema = z.object({
  teamId: z.string().trim().min(1, "Équipe introuvable"),
  role: z.enum(playerRoles),
});

export const openPositionIdSchema = z.object({
  positionId: z.string().trim().min(1, "Poste introuvable"),
});

export const publishLfpSchema = z.object({
  positionId: z.string().trim().min(1, "Poste introuvable"),
});
