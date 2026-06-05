import { z } from "zod";

import type { TFunction } from "i18next";

// New-ticket form. Lengths are user-friendly minimums; the upper bounds the
// backend enforces (subject 200, body 10000) are kept off the schema and
// applied as input maxLength in the form so the user simply can't exceed them.
export const getCreateTicketSchema = (t: TFunction) =>
  z.object({
    subject: z.string().min(5, { message: t("validation:subjectMin", { count: 5 }) }),
    body: z.string().min(10, { message: t("validation:bodyMin", { count: 10 }) }),
    attachment_file_ids: z.array(z.string()).optional(),
  });

export type CreateTicketFormValues = z.infer<ReturnType<typeof getCreateTicketSchema>>;

// Reply form: any non-empty message is valid.
export const getReplySchema = (t: TFunction) =>
  z.object({
    body: z.string().min(1, { message: t("validation:messageRequired") }),
    attachment_file_ids: z.array(z.string()).optional(),
  });

export type ReplyFormValues = z.infer<ReturnType<typeof getReplySchema>>;
