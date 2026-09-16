import { z } from "zod";

export const openConversationSchema = z.object({
  candidateUserId: z.string().trim().min(1, "Destinataire requis"),
});

export const openTeamConversationSchema = z.object({
  teamId: z.string().trim().min(1, "Équipe requise"),
});

export const sendChatMessageSchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation requise"),
  body: z
    .string()
    .trim()
    .min(1, "Message vide")
    .max(2000, "Message trop long (2000 caractères)"),
});

export const casterProfileSchema = z.object({
  streamUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "L'URL de stream doit commencer par http:// ou https://",
    ),
  vodUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "L'URL VOD doit commencer par http:// ou https://",
    ),
  eventsNote: z.string().trim().max(2000, "Texte trop long"),
});
