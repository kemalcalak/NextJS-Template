import { z } from "zod";

import { SystemRole } from "@/lib/types/user";

import type { TFunction } from "i18next";

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
    email: z
      .string()
      .trim()
      .min(1, { message: t("validation:emailRequired") })
      .pipe(z.email({ message: t("validation:emailInvalid") })),
    role: z.enum(SystemRole),
    is_active: z.boolean(),
    is_verified: z.boolean(),
  });

export type AdminUserUpdateFormValues = z.infer<ReturnType<typeof getAdminUserUpdateSchema>>;
