"use client";

import { useTranslation } from "react-i18next";

import type { AdminUser } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "muted" | "primary";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
};

export function StatusBadge({
  tone = "muted",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Maps a user's active/deletion_scheduled state to a single badge. Kept next
// to StatusBadge so pages don't each re-derive "pending deletion vs active vs
// inactive" with nested ternaries.
export function UserStatusBadge({ user }: { user: AdminUser }) {
  const { t } = useTranslation("admin");

  if (user.deletion_scheduled_at) {
    return <StatusBadge tone="warning">{t("users.status.pendingDeletion")}</StatusBadge>;
  }
  if (user.is_active) {
    return <StatusBadge tone="success">{t("users.status.active")}</StatusBadge>;
  }
  return <StatusBadge tone="muted">{t("users.status.inactive")}</StatusBadge>;
}
