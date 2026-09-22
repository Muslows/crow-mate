import { z } from "zod";
import { WEEKDAY_KEYS } from "@/lib/week";

const slotIdListSchema = z.array(z.string().min(1)).max(12);

export const weeklyAvailabilitySchema = z.object({
  weekStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de semaine invalide"),
  mondaySlots: slotIdListSchema.default([]),
  tuesdaySlots: slotIdListSchema.default([]),
  wednesdaySlots: slotIdListSchema.default([]),
  thursdaySlots: slotIdListSchema.default([]),
  fridaySlots: slotIdListSchema.default([]),
  saturdaySlots: slotIdListSchema.default([]),
  sundaySlots: slotIdListSchema.default([]),
});

export const officialScrimSlotSchema = z.enum([
  "NONE",
  "SCRIM_20H",
  "SCRIM_21H",
  "VOD_REVIEW",
  "TOURNOI",
  "CUSTOM",
  "TBD",
]);

export const officialNoteSchema = z.string().trim().max(50, "50 caractères max").default("");

export const officialScheduleSchema = z
  .object({
    teamId: z.string().min(1, "Équipe requise"),
    weekStartDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de semaine invalide"),
    monday: officialScrimSlotSchema,
    tuesday: officialScrimSlotSchema,
    wednesday: officialScrimSlotSchema,
    thursday: officialScrimSlotSchema,
    friday: officialScrimSlotSchema,
    saturday: officialScrimSlotSchema,
    sunday: officialScrimSlotSchema,
    mondayNote: officialNoteSchema,
    tuesdayNote: officialNoteSchema,
    wednesdayNote: officialNoteSchema,
    thursdayNote: officialNoteSchema,
    fridayNote: officialNoteSchema,
    saturdayNote: officialNoteSchema,
    sundayNote: officialNoteSchema,
  })
  .superRefine((data, ctx) => {
    for (const key of WEEKDAY_KEYS) {
      const noteKey = `${key}Note` as const;
      if (data[key] === "CUSTOM" && !data[noteKey]) {
        ctx.addIssue({
          code: "custom",
          path: [noteKey],
          message: "Saisis un libellé custom (50 caractères max)",
        });
      }
    }
  });

export const teamTimeSlotSchema = z.object({
  teamId: z.string().min(1, "Équipe requise"),
  startTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, "Heure de début invalide (HH:MM)"),
  endTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, "Heure de fin invalide (HH:MM)"),
  label: z.string().trim().max(40, "40 caractères max").optional(),
});

export const teamTimeSlotIdSchema = z.object({
  teamId: z.string().min(1, "Équipe requise"),
  slotId: z.string().min(1, "Créneau introuvable"),
});
