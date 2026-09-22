import { z } from "zod";
import { WEEKDAY_KEYS } from "@/lib/week";

export const scrimProposalCreateSchema = z.object({
  fromTeamId: z.string().min(1, "Équipe requise"),
  toTeamId: z.string().min(1, "Adversaire requis"),
  weekStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de semaine invalide"),
  weekday: z.enum(WEEKDAY_KEYS),
  slot: z.string().min(1, "Créneau requis"),
});

export const scrimProposalRespondSchema = z.object({
  proposalId: z.string().min(1, "Proposition introuvable"),
  decision: z.enum(["accept", "refuse"]),
});

export const scrimProposalCancelSchema = z
  .object({
    proposalId: z.string().min(1, "Scrim introuvable"),
    viewerTeamId: z.string().min(1, "Équipe introuvable"),
    reason: z.enum([
      "ROSTER_UNAVAILABLE",
      "TECHNICAL_ISSUE",
      "SCHEDULE_ERROR",
      "OTHER",
    ]),
    details: z.string().trim().max(500, "500 caractères max"),
  })
  .superRefine((value, context) => {
    if (value.reason === "OTHER" && value.details.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["details"],
        message: "Précise la raison de l’annulation",
      });
    }
  });
