"use client";

import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/admin/StatusBadge";
import type { TicketPriority, TicketStatus } from "@/lib/types/support";

// `as const` keeps the values as literal tones so they satisfy StatusBadge's
// `tone` prop without re-exporting its private union.
const STATUS_TONE = {
  open: "primary",
  pending: "warning",
  answered: "success",
  closed: "muted",
} as const;

const PRIORITY_TONE = {
  low: "muted",
  normal: "primary",
  high: "danger",
} as const;

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const { t } = useTranslation("support");
  return <StatusBadge tone={STATUS_TONE[status]}>{t(`status.${status}`)}</StatusBadge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const { t } = useTranslation("support");
  return <StatusBadge tone={PRIORITY_TONE[priority]}>{t(`priority.${priority}`)}</StatusBadge>;
}
