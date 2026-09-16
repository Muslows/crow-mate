import { z } from "zod";
import { WEEKDAY_KEYS } from "@/lib/week";

export const scrimProposalCreateSchema = z.object({
  fromTeamId: z.string().min(1, "Équipe requise"),
  toTeamId: z.string().min(1, "Adversaire requis"),
  weekStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de semaine invalide"),
  weekday: z.enum(WEEKDAY_KEYS),
  slot: z.enum(["SCRIM_20H", "SCRIM_21H"]),
});

export const scrimProposalRespondSchema = z.object({
  proposalId: z.string().min(1, "Proposition introuvable"),
  decision: z.enum(["accept", "refuse"]),
});
