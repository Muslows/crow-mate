import { z } from "zod";

export const reportSchema = z.object({
  targetType: z.enum(["PLAYER", "TEAM"]),
  targetId: z.string().trim().min(1, "Cible requise"),
  reason: z.enum(["TOXIC", "FAKE_PROFILE", "WRONG_BATTLETAG", "OTHER"], {
    message: "Choisis un motif",
  }),
  details: z.string().trim().max(1000, "Détails trop longs (1000 caractères)"),
});
