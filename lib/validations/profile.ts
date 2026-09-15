import { z } from "zod";
import { requiredHeroTierSchema } from "@/lib/validations/heroes";
import { srSchema } from "@/lib/validations/sr";
import { SPOKEN_LANGUAGES } from "@/lib/constants";

const SPOKEN_LANGUAGE_VALUES = SPOKEN_LANGUAGES.map((item) => item.value) as [
  (typeof SPOKEN_LANGUAGES)[number]["value"],
  ...(typeof SPOKEN_LANGUAGES)[number]["value"][],
];

const roleEnum = z.enum(["TANK", "DPS", "SUPPORT"], {
  message: "Choisis un rôle (Tank, DPS ou Support)",
});

const battleTagSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9]{3,12}#\d{4,6}$/,
    "BattleTag invalide (ex: Player#1234)",
  );

export const playerProfileSchema = z
  .object({
    battleTag: battleTagSchema,
    sr: srSchema,
    primaryRole: roleEnum,
    secondaryRole: z
      .union([roleEnum, z.literal("")])
      .transform((value) => (value === "" ? null : value)),
    favoriteHeroes: requiredHeroTierSchema,
    languages: z
      .array(z.enum(SPOKEN_LANGUAGE_VALUES))
      .max(SPOKEN_LANGUAGE_VALUES.length)
      .default([]),
    experience: z.string().trim().max(2000, "2000 caractères max").default(""),
    recruitmentStatus: z.enum(["LOOKING", "NOT_LOOKING"]).default("LOOKING"),
  })
  .refine(
    (data) => data.secondaryRole === null || data.secondaryRole !== data.primaryRole,
    {
      message: "Le rôle secondaire doit être différent du rôle principal",
      path: ["secondaryRole"],
    },
  );

export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
