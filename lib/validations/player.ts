import { z } from "zod";

export const rosterStatusSchema = z.object({
  status: z.enum(["STARTER", "SUBSTITUTE", "TRIAL"], {
    message: "Choisis un statut de roster",
  }),
  teamId: z.string().min(1, "L'équipe est obligatoire"),
});

export const playerIdSchema = z.string().min(1, "Joueur introuvable");

export type RosterStatusInput = z.infer<typeof rosterStatusSchema>;
