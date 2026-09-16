import { z } from "zod";

export const staffMemberSchema = z.object({
  structureId: z.string().min(1, "Structure requise"),
  userId: z.string().trim().min(8, "Saisis l'ID utilisateur"),
  role: z.enum(["COACH", "ASSISTANT_COACH", "ANALYST"], {
    message: "Choisis un rôle staff",
  }),
});

export const staffIdSchema = z.object({
  staffId: z.string().min(1, "Membre introuvable"),
});

export const assignManagerSchema = z.object({
  structureId: z.string().min(1, "Structure requise"),
  teamId: z.string().min(1, "Équipe requise"),
  userId: z.string().trim().min(8, "Saisis l'ID du manager"),
});
