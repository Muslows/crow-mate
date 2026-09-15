import { z } from "zod";

export const createInvitationSchema = z.object({
  teamId: z.string().min(1, "Choisis une équipe"),
  playerId: z.string().trim().min(8, "Saisis le Player ID"),
  message: z.string().trim().max(500, "500 caractères max").default(""),
});

export const respondInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation introuvable"),
  decision: z.enum(["accept", "refuse"]),
});
