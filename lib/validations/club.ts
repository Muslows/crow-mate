import { z } from "zod";

export const clubInviteSchema = z.object({
  childTeamId: z.string().min(1, "Équipe requise"),
  parentTeamId: z.string().trim().min(8, "Saisis le Team ID du club parent"),
});

export const clubInviteResponseSchema = z.object({
  invitationId: z.string().min(1, "Invitation introuvable"),
  decision: z.enum(["accept", "refuse"]),
});
