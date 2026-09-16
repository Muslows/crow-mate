import { z } from "zod";
import { OW_HERO_NAMES } from "@/lib/constants";

export const heroTierSchema = z.array(z.enum(OW_HERO_NAMES)).default([]);

export const requiredHeroTierSchema = heroTierSchema;
export const optionalHeroTierSchema = heroTierSchema;
