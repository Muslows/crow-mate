import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email invalide"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm: z.string().min(8, "Confirme le mot de passe"),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });
