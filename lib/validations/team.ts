import { z } from "zod";
import { SPOKEN_LANGUAGES } from "@/lib/constants";
import { srSchema } from "@/lib/validations/sr";

const SPOKEN_LANGUAGE_VALUES = SPOKEN_LANGUAGES.map((item) => item.value) as [
  (typeof SPOKEN_LANGUAGES)[number]["value"],
  ...(typeof SPOKEN_LANGUAGES)[number]["value"][],
];

const switchSchema = z
  .union([
    z.boolean(),
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === true || value === "on" || value === "true");

export const teamScrimConfigSchema = z.object({
  discordManager: z.string().trim().max(80, "80 caractères max"),
  battleTagContact: z
    .string()
    .trim()
    .max(32, "32 caractères max")
    .refine(
      (value) => value === "" || /^[A-Za-z0-9]{3,12}#\d{4,6}$/.test(value),
      "BattleTag invalide (ex: Player#1234)",
    ),
  stagger: switchSchema,
  povStream: switchSchema,
  mapPool: z.enum(["OFFICIEL", "ALTERNATIVE", "LOOSERPICK", "CUSTOM"], {
    message: "Choisis un map pool",
  }),
  lobbyHost: z.enum(
    [
      "NOUS_UNIQUEMENT",
      "PREFERENCE_NOUS",
      "PEU_IMPORTE",
      "PREFERENCE_VOUS",
      "VOUS_UNIQUEMENT",
    ],
    { message: "Choisis une préférence d'hôte" },
  ),
});

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(80, "Le nom est trop long"),
  structure: z.enum(["CLUB", "ASSOCIATION"], {
    message: "Choisis une forme juridique (club ou association)",
  }),
  platform: z.enum(["PC", "CONSOLE", "MIXED"], {
    message: "Choisis une plateforme",
  }),
  language: z.enum(SPOKEN_LANGUAGE_VALUES, {
    message: "Choisis la langue officielle de l'équipe",
  }),
  estimatedSr: srSchema,
  format: z.enum(["STANDARD_5V5", "CUSTOM"], {
    message: "Choisis le format de l'équipe",
  }),
  affiliationMode: z.enum(["INDEPENDENT", "CLUB", "STRUCTURE"]).default("INDEPENDENT"),
  affiliationId: z.string().trim().max(128).optional().default(""),
});

export const createTeamSchema = teamSchema.extend({
  leadership: z.enum(["MANAGER", "CAPTAIN"], {
    message: "Choisis Manager pur ou Capitaine",
  }),
});

export const designateTeamManagerSchema = z.object({
  teamId: z.string().min(1, "Équipe introuvable"),
  userId: z.string().trim().min(8, "Saisis l'ID utilisateur"),
  mode: z.enum(["CO_MANAGER", "TRANSFER"], {
    message: "Choisis co-manager ou transfert",
  }),
});

export const teamIdSchema = z.string().min(1, "Équipe introuvable");

export type TeamInput = z.infer<typeof teamSchema>;
