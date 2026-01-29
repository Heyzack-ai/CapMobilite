import { z } from "zod";

// Password requirements from frontend-specs.md
export const passwordSchema = z
  .string()
  .min(12, "Minimum 12 caractères")
  .regex(/[A-Z]/, "Une majuscule requise")
  .regex(/[a-z]/, "Une minuscule requise")
  .regex(/[0-9]/, "Un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Un caractère spécial requis");

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registrationStep1Schema = z.object({
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^\+33[0-9]{9}$/, "Format: +33612345678"),
});

export const registrationStep2Schema = z.object({
  firstName: z.string().min(2, "Prénom requis").max(100),
  lastName: z.string().min(2, "Nom requis").max(100),
  dateOfBirth: z.string().refine(
    (date) => {
      const d = new Date(date);
      return d < new Date() && d > new Date("1900-01-01");
    },
    { message: "Date de naissance invalide" }
  ),
});

export const registrationStep3Schema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les CGU",
  }),
  acceptHealthDataConsent: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter le traitement des données de santé",
  }),
  acceptMarketing: z.boolean().optional(),
});

export const fullRegistrationSchema = registrationStep1Schema
  .merge(registrationStep2Schema)
  .merge(registrationStep3Schema);

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^[0-9]+$/, "Le code ne doit contenir que des chiffres"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const mfaVerifySchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^[0-9]+$/, "Le code ne doit contenir que des chiffres"),
  rememberDevice: z.boolean().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationStep1Data = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2Data = z.infer<typeof registrationStep2Schema>;
export type RegistrationStep3Data = z.infer<typeof registrationStep3Schema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;
export type VerificationCodeData = z.infer<typeof verificationCodeSchema>;
export type ResetPasswordRequestData = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordConfirmData = z.infer<typeof resetPasswordConfirmSchema>;
export type MfaVerifyData = z.infer<typeof mfaVerifySchema>;
