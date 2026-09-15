import { z } from "zod";
import { SPOKEN_LANGUAGES } from "@/lib/constants";

const SPOKEN_LANGUAGE_VALUES = SPOKEN_LANGUAGES.map((item) => item.value) as [
  (typeof SPOKEN_LANGUAGES)[number]["value"],
  ...(typeof SPOKEN_LANGUAGES)[number]["value"][],
];

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(80, "Le nom est trop long"),
  structure: z.enum(["CLUB", "ASSOCIATION"], {
    message: "Choisis une structure (club ou association)",
  }),
  platform: z.enum(["PC", "CONSOLE", "MIXED"], {
    message: "Choisis une plateforme",
  }),
  language: z.enum(SPOKEN_LANGUAGE_VALUES, {
    message: "Choisis la langue officielle de l'équipe",
  }),
});

export const teamIdSchema = z.string().min(1, "Équipe introuvable");

export type TeamInput = z.infer<typeof teamSchema>;
