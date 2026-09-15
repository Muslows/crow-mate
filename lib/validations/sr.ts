import { z } from "zod";
import { SR_MAX, SR_MIN } from "@/lib/rank";

export const srSchema = z
  .string()
  .trim()
  .min(1, "Le SR est requis")
  .regex(/^\d+$/, "Le SR doit être un nombre entier")
  .transform((value) => Number.parseInt(value, 10))
  .pipe(
    z
      .number()
      .int()
      .min(SR_MIN, "Le SR ne peut pas être négatif")
      .max(SR_MAX, `Le SR max est ${SR_MAX}`),
  );
