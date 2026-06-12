"use client";

import { useTranslation } from "react-i18next";

import { notificationText } from "@/components/common/notification-text";
import { formatDateTime } from "@/lib/format-date";
import { type NotificationItem } from "@/lib/types/notification";
import { cn } from "@/lib/utils";

interface NotificationRowProps {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}

export const NotificationRow = ({ item, onClick }: NotificationRowProps) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => {
        onClick(item);
      }}
      className="flex w-full items-start gap-2.5 border-b border-border/40 px-3 py-2.5 text-left transition-colors hover:bg-muted last:border-b-0"
    >
      <span
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          item.read_at ? "bg-transparent" : "bg-primary",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm leading-snug", !item.read_at && "font-medium")}>
          {notificationText(t, item)}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {formatDateTime(item.created_at)}
        </span>
      </span>
    </button>
  );
};
