import { z } from "zod";

export const discordSnowflakeSchema = z
  .string()
  .trim()
  .regex(/^\d{17,19}$/, "Identifiant Discord invalide.");

export const optionalDiscordSnowflakeSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{17,19}$/.test(value),
    "Identifiant Discord invalide.",
  );

const checkboxValue = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("")])
  .optional()
  .transform((value) => value === true || value === "on" || value === "true");

export const discordBotPreferencesSchema = z.object({
  notifyDiscordMessages: checkboxValue,
  notifyDiscordInvitations: checkboxValue,
  notifyDiscordScrims: checkboxValue,
  notifyDiscordCancellations: checkboxValue,
});

export const discordOAuthStateSchema = z.object({
  userId: z.string().min(1),
  nonce: z
    .string()
    .regex(/^[0-9a-f]{32}$/, "État OAuth invalide."),
  expiresAt: z.number().int().positive(),
  intent: z.enum(["identify", "guild"]).optional(),
  teamId: z.string().min(1).optional(),
});
