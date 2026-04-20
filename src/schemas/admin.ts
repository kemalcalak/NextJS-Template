import { z } from "zod";

import { SystemRole } from "@/lib/types/user";

import type { TFunction } from "i18next";

// Email is intentionally NOT in this schema. An admin must never be able to
// rewrite a user's identity (login + recovery channel); the field is hidden
// from the form and the backend rejects ``email`` in the payload with 422.
// Names accept either a >=2-char trimmed string OR an empty string. The
// backend models them as ``string | null``, and existing rows can carry null
// or pre-policy short values; refusing to save the form unless every name
// passes ``min(2)`` would lock admins out of editing flags/title/role on
// those users. The submit handler converts empty strings back to ``null``
// before sending.
export const getAdminUserUpdateSchema = (t: TFunction) =>
  z.object({
    first_name: z
      .string()
      .trim()
      .min(2, { message: t("validation:nameMin", { count: 2 }) })
      .max(100)
      .or(z.literal("")),
    last_name: z
      .string()
      .trim()
      .min(2, { message: t("validation:nameMin", { count: 2 }) })
      .max(100)
      .or(z.literal("")),
    title: z.string().trim().max(100).optional().or(z.literal("")),
    role: z.enum(SystemRole),
    is_active: z.boolean(),
    is_verified: z.boolean(),
  });

export type AdminUserUpdateFormValues = z.infer<ReturnType<typeof getAdminUserUpdateSchema>>;
