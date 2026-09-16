import { z } from "zod";
import { heroTierSchema } from "@/lib/validations/heroes";
import { srSchema } from "@/lib/validations/sr";
import { SPOKEN_LANGUAGES } from "@/lib/constants";

const SPOKEN_LANGUAGE_VALUES = SPOKEN_LANGUAGES.map((item) => item.value) as [
  (typeof SPOKEN_LANGUAGES)[number]["value"],
  ...(typeof SPOKEN_LANGUAGES)[number]["value"][],
];

export const playerRoleEnum = z.enum(
  ["TANK", "DPS_HITSCAN", "DPS_FLEX", "MAIN_SUPPORT", "FLEX_SUPPORT"],
  { message: "Choisis un rôle compétitif" },
);

const battleTagSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9]{3,12}#\d{4,6}$/,
    "BattleTag invalide (ex: Player#1234)",
  );

export const playerProfileSchema = z.object({
  battleTag: battleTagSchema,
  displayName: z
    .string()
    .trim()
    .max(32, "32 caractères max")
    .regex(/^[\p{L}0-9 _.-]*$/u, "Lettres, chiffres, espaces, _ . - uniquement")
    .default(""),
  sr: srSchema,
  openToPlay: z.array(playerRoleEnum).default([]),
  favoriteHeroes: heroTierSchema,
  languages: z
    .array(z.enum(SPOKEN_LANGUAGE_VALUES))
    .max(SPOKEN_LANGUAGE_VALUES.length)
    .default([]),
  experience: z.string().trim().max(2000, "2000 caractères max").default(""),
  recruitmentStatus: z.enum(["LOOKING", "NOT_LOOKING"]).default("LOOKING"),
  battleTagPublic: z
    .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((value) => value === true || value === "on" || value === "true"),
});

export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
