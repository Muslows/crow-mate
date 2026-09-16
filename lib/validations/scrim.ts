import { z } from "zod";
import { OW_MAP_NAMES } from "@/lib/ow-maps";
import { SR_MAX, SR_MIN } from "@/lib/rank";

const mapNameEnum = z.enum(OW_MAP_NAMES, {
  message: "Choisis une map",
});

export const scrimMapResultSchema = z.object({
  mapName: mapNameEnum,
  outcome: z.enum(["WIN", "LOSS"], { message: "Indique gagné ou perdu" }),
  intensity: z.coerce
    .number()
    .int()
    .min(1, "Intensité entre 1 et 3")
    .max(3, "Intensité entre 1 et 3"),
});

const opponentFields = {
  opponentTeamId: z.string().trim().optional().default(""),
  opponentNameInput: z.string().trim().max(48, "48 caractères max").optional().default(""),
  opponentSrInput: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    return value;
  }, z.coerce.number().int().min(SR_MIN).max(SR_MAX).optional()),
};

export const opponentBehaviorSchema = z.enum(
  ["COURTOIS", "BON", "PEU_AGREABLE", "TOXIQUE_OU_TROLL"],
  { message: "Évalue le comportement adverse" },
);

export const scrimReportSchema = z
  .object({
    teamId: z.string().min(1, "Équipe requise"),
    ...opponentFields,
    opponentBehavior: opponentBehaviorSchema,
    playedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
      .optional(),
    maps: z
      .array(scrimMapResultSchema)
      .min(1, "Ajoute au moins une map")
      .max(12, "12 maps max"),
  })
  .superRefine((data, ctx) => {
    if (data.opponentTeamId === data.teamId) {
      ctx.addIssue({
        code: "custom",
        path: ["opponentTeamId"],
        message: "L'adversaire ne peut pas être ta propre équipe",
      });
    }
    if (!data.opponentTeamId && data.opponentNameInput.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["opponentNameInput"],
        message: "Sélectionne une équipe ou saisis un nom (2 caractères min)",
      });
    }
  });

export const scrimOpponentSchema = z
  .object({
    scrimId: z.string().min(1, "Scrim introuvable"),
    teamId: z.string().min(1, "Équipe requise"),
    ...opponentFields,
  })
  .superRefine((data, ctx) => {
    if (data.opponentTeamId === data.teamId) {
      ctx.addIssue({
        code: "custom",
        path: ["opponentTeamId"],
        message: "L'adversaire ne peut pas être ta propre équipe",
      });
    }
    if (!data.opponentTeamId && data.opponentNameInput.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["opponentNameInput"],
        message: "Sélectionne une équipe ou saisis un nom (2 caractères min)",
      });
    }
  });

export const scrimIdSchema = z.string().min(1, "Scrim introuvable");

export type ScrimReportInput = z.infer<typeof scrimReportSchema>;
