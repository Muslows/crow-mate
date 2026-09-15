import { z } from "zod";
import { optionalHeroTierSchema } from "@/lib/validations/heroes";
import { srSchema } from "@/lib/validations/sr";

const roleEnum = z.enum(["TANK", "DPS", "SUPPORT"], {
  message: "Choisis un rôle (Tank, DPS ou Support)",
});

export const rosterHeroesSchema = optionalHeroTierSchema;

export const playerSchema = z
  .object({
    battleTag: z
      .string()
      .trim()
      .regex(
        /^[A-Za-z0-9]{3,12}#\d{4,6}$/,
        "BattleTag invalide (ex: Player#1234)",
      ),
    role: roleEnum,
    secondaryRole: z
      .union([roleEnum, z.literal("")])
      .transform((value) => (value === "" ? null : value)),
    sr: srSchema,
    status: z.enum(["STARTER", "SUBSTITUTE", "TRIAL"], {
      message: "Choisis un statut de roster",
    }),
    teamId: z.string().min(1, "L'équipe est obligatoire"),
    favoriteHeroes: rosterHeroesSchema,
    experience: z.string().trim().max(2000, "2000 caractères max").default(""),
  })
  .refine(
    (data) => data.secondaryRole === null || data.secondaryRole !== data.role,
    {
      message: "Le rôle secondaire doit être différent du rôle principal",
      path: ["secondaryRole"],
    },
  );

export const playerIdSchema = z.string().min(1, "Joueur introuvable");

export type PlayerInput = z.infer<typeof playerSchema>;
