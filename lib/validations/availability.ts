import { z } from "zod";
import { WEEKDAY_KEYS } from "@/lib/week";

export const dayAvailabilitySchema = z.enum([
  "DISPO_20H",
  "DISPO_21H",
  "INCERTAIN",
  "INDISPO",
]);

export const weeklyAvailabilitySchema = z.object({
  weekStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de semaine invalide"),
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
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

export function weekDaysFromForm(formData: FormData) {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((key) => [key, formData.get(key)]),
  );
}
