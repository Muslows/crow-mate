import { playerRoleEnum } from "@/lib/validations/profile";
import { z } from "zod";

export const openFlagSchema = z.enum(["CLOSED", "OPEN"]);

export const toggleOpenFlagSchema = z.object({
  flag: z.enum(["openToCast", "openToCoach"]),
  value: openFlagSchema,
});

export const playOpenFlagsSchema = z.object({
  openToPlay: z.array(playerRoleEnum).default([]),
});

export const battleTagVisibilitySchema = z.object({
  battleTagPublic: z
    .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((value) => value === true || value === "on" || value === "true"),
});
