import { z } from "zod";

import { SystemRole } from "@/lib/types/user";

import type { TFunction } from "i18next";

// Email is intentionally NOT in this schema. An admin must never be able to
// rewrite a user's identity (login + recovery channel); the field is hidden
// from the form and the backend rejects ``email`` in the payload with 422.
export const getAdminUserUpdateSchema = (t: TFunction) =>
  z.object({
    first_name: z
      .string()
      .trim()
      .min(2, { message: t("validation:nameMin", { count: 2 }) })
      .max(100),
    last_name: z
      .string()
      .trim()
      .min(2, { message: t("validation:nameMin", { count: 2 }) })
      .max(100),
    title: z.string().trim().max(100).optional().or(z.literal("")),
    role: z.enum(SystemRole),
    is_active: z.boolean(),
    is_verified: z.boolean(),
  });

export type AdminUserUpdateFormValues = z.infer<ReturnType<typeof getAdminUserUpdateSchema>>;
