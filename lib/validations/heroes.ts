import { z } from "zod";
import { OW_HERO_NAMES } from "@/lib/constants";
import {
  countHeroesByRole,
  HERO_PER_ROLE_MAX,
  HERO_TOTAL_MIN,
} from "@/lib/heroes";

export const requiredHeroTierSchema = z
  .array(z.enum(OW_HERO_NAMES))
  .superRefine((heroes, ctx) => {
    if (heroes.length < HERO_TOTAL_MIN) {
      ctx.addIssue({
        code: "custom",
        message: `Choisis au moins ${HERO_TOTAL_MIN} héros`,
      });
    }
    const counts = countHeroesByRole(heroes);
    for (const [role, count] of Object.entries(counts)) {
      if (count > HERO_PER_ROLE_MAX) {
        ctx.addIssue({
          code: "custom",
          message: `Maximum ${HERO_PER_ROLE_MAX} héros ${role}`,
        });
      }
    }
  });

export const optionalHeroTierSchema = z
  .array(z.enum(OW_HERO_NAMES))
  .superRefine((heroes, ctx) => {
    if (heroes.length === 0) return;
    const nested = requiredHeroTierSchema.safeParse(heroes);
    if (nested.success) return;
    for (const issue of nested.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message });
    }
  });
