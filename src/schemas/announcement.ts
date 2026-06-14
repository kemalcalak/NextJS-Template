import { z } from "zod";

import type { TFunction } from "i18next";

// Mirrors the backend per-language content limits (banner stays single-line on
// desktop, readable in the mobile modal). The Ant inputs hard-cap with
// `maxLength`, so these Zod bounds are a safety net; min(1) drives the inline
// "required" error per language field.
export const ANNOUNCEMENT_TITLE_MAX = 120;
export const ANNOUNCEMENT_BODY_MAX = 600;

export const getAnnouncementContentSchema = (t: TFunction) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: t("validation:titleRequired") })
      .max(ANNOUNCEMENT_TITLE_MAX),
    body: z
      .string()
      .trim()
      .min(1, { message: t("validation:messageRequired") })
      .max(ANNOUNCEMENT_BODY_MAX),
  });

export type AnnouncementContentValues = z.infer<ReturnType<typeof getAnnouncementContentSchema>>;
