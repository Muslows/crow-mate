import { z } from "zod";

const visibilityValue = z
  .union([
    z.boolean(),
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === true || value === "on" || value === "true");

export const emailChangeSchema = z.object({
  email: z.email("Adresse email invalide.").transform((value) => value.toLowerCase()),
});

export const strongPasswordSchema = z
  .string()
  .min(12, "Utilise au moins 12 caractères.")
  .max(128, "Le mot de passe est trop long.")
  .regex(/[a-z]/, "Ajoute une lettre minuscule.")
  .regex(/[A-Z]/, "Ajoute une lettre majuscule.")
  .regex(/[0-9]/, "Ajoute un chiffre.")
  .regex(/[^A-Za-z0-9]/, "Ajoute un caractère spécial.");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Saisis ton mot de passe actuel."),
    password: strongPasswordSchema,
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Les nouveaux mots de passe ne correspondent pas.",
    path: ["confirm"],
  })
  .refine((value) => value.currentPassword !== value.password, {
    message: "Choisis un mot de passe différent de l’actuel.",
    path: ["password"],
  });

export const discordSettingsSchema = z.object({
  discord: z
    .string()
    .trim()
    .max(64, "L’identifiant Discord ne peut pas dépasser 64 caractères.")
    .refine((value) => !/[\r\n\u0000-\u001f\u007f]/.test(value), {
      message: "L’identifiant Discord contient des caractères invalides.",
    }),
  discordPublic: visibilityValue,
});

export const deactivateAccountSchema = z.object({
  currentPassword: z.string().min(8, "Saisis ton mot de passe actuel."),
  confirmation: z
    .string()
    .trim()
    .refine((value) => value === "SUPPRIMER", {
      message: "Saisis exactement SUPPRIMER.",
    }),
});
