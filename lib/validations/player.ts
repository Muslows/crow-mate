import { z } from "zod";
import { playerRoleEnum } from "@/lib/validations/profile";

export const rosterStatusSchema = z.object({
  status: z.enum(["STARTER", "SUBSTITUTE", "TRIAL"], {
    message: "Choisis un statut de roster",
  }),
  teamId: z.string().min(1, "L'équipe est obligatoire"),
});

export const playerIdSchema = z.string().min(1, "Joueur introuvable");

export const membershipRolesSchema = z.object({
  membershipId: z.string().min(1, "Membre introuvable"),
  teamId: z.string().min(1, "L'équipe est obligatoire"),
  playerRole: z
    .union([playerRoleEnum, z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  orgRoles: z
    .array(z.enum(["PLAYER", "CAPTAIN", "COACH", "MANAGER"]))
    .default(["PLAYER"])
    .transform((roles) => (roles.length > 0 ? Array.from(new Set(roles)) : ["PLAYER"])),
});

export type RosterStatusInput = z.infer<typeof rosterStatusSchema>;
