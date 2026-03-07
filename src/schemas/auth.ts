import { z } from "zod";

import type { TFunction } from "i18next";

const getPasswordSchema = (t: TFunction) =>
  z
    .string()
    .min(6, { message: t("passwordMin", { count: 6 }) })
    .regex(/[A-Z]/, { message: t("passwordUppercase") })
    .regex(/[a-z]/, { message: t("passwordLowercase") })
    .regex(/[0-9]/, { message: t("passwordNumber") })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: t("passwordSpecial") });

const getEmailSchema = (t: TFunction) =>
  z
    .string()
    .min(1, { message: t("emailRequired") })
    .pipe(z.email({ message: t("emailInvalid") }));

export const getLoginSchema = (t: TFunction) =>
  z.object({
    email: getEmailSchema(t),
    password: z.string().min(1, { message: t("passwordRequired") }),
    rememberMe: z.boolean(),
  });

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>;

export const getRegisterSchema = (t: TFunction) =>
  z
    .object({
      first_name: z.string().min(2, { message: t("nameMin", { count: 2 }) }),
      last_name: z.string().min(2, { message: t("nameMin", { count: 2 }) }),
      email: getEmailSchema(t),
      password: getPasswordSchema(t),
      confirmPassword: z.string().min(1, { message: t("confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPasswordMismatch"),
      path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;

export const getForgotSchema = (t: TFunction) =>
  z.object({
    email: getEmailSchema(t),
  });

export type ForgotFormValues = z.infer<ReturnType<typeof getForgotSchema>>;

export const getResetSchema = (t: TFunction) =>
  z
    .object({
      password: getPasswordSchema(t),
      confirmPassword: z.string().min(1, { message: t("confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPasswordMismatch"),
      path: ["confirmPassword"],
    });

export type ResetFormValues = z.infer<ReturnType<typeof getResetSchema>>;

export const getResendVerificationSchema = (t: TFunction) =>
  z.object({
    email: getEmailSchema(t),
  });

export type ResendVerificationFormValues = z.infer<ReturnType<typeof getResendVerificationSchema>>;
