import { z } from "zod";
import {
  LFS_PLATFORMS,
  LFS_REGIONS,
  LFS_START_HOURS,
} from "@/lib/lfs";
import { WEEKDAY_KEYS } from "@/lib/week";

const startHourSchema = z.coerce
  .number()
  .int()
  .refine(
    (value): value is (typeof LFS_START_HOURS)[number] =>
      (LFS_START_HOURS as readonly number[]).includes(value),
    "Créneau 20h ou 21h.",
  );

export const announcementIdSchema = z.object({
  announcementId: z.string().trim().min(1, "Annonce introuvable"),
});

export const createLfsAnnouncementSchema = z.object({
  teamId: z.string().min(1, "Équipe introuvable"),
  content: z.string().trim().min(8, "Le modèle LFS est trop court.").max(500),
  region: z.enum(LFS_REGIONS),
  platform: z.enum(LFS_PLATFORMS),
  weekday: z.enum(WEEKDAY_KEYS),
  startHour: startHourSchema,
});
