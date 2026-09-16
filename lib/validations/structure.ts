import { z } from "zod";

export const structureTagSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^[A-Z]{2,5}$/,
        "Le tag doit contenir 2 à 5 lettres (A–Z)",
      ),
  );

export const structureSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(80, "Le nom est trop long"),
  tag: structureTagSchema,
  ownerId: z.string().min(1, "Le propriétaire est obligatoire"),
});

export const structureIdSchema = z.string().min(1, "Structure introuvable");
export const teamAttachSchema = z.object({
  structureId: structureIdSchema,
  teamId: z.string().trim().min(1, "Le Team ID est obligatoire"),
});
export const structureInviteResponseSchema = z.object({
  invitationId: z.string().min(1, "Invitation introuvable"),
  decision: z.enum(["accept", "refuse"]),
});

export const structureJoinRequestSchema = z.object({
  teamId: z.string().min(1, "Équipe requise"),
  structureId: z.string().trim().min(8, "Saisis l'ID de la structure"),
});

export type StructureInput = z.infer<typeof structureSchema>;
