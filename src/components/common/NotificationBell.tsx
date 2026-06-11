"use client";

import { useState } from "react";

import { Badge, Dropdown } from "antd";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/api/use-notifications";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import { ROUTES, getLocaleFromPath, getLocalizedPath } from "@/lib/config/routes";
import { formatDateTime } from "@/lib/format-date";
import { type NotificationItem } from "@/lib/types/notification";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

import type { TFunction } from "i18next";

// The panel shows the most recent slice of the inbox; older entries stay
// reachable via the API's pagination if a full inbox page is added later.
const PANEL_LIMIT = 10;

const readString = (item: NotificationItem, key: string): string => {
  const value = item.data[key];
  return typeof value === "string" ? value : "";
};

// Map a stored notification (type + data payload) to a translated message.
// The backend persists no human-readable text, so this is the single place
// where notification copy is produced.
const notificationText = (t: TFunction, item: NotificationItem): string => {
  switch (item.type) {
    case "support_ticket_replied":
      return t("notifications:types.support_ticket_replied", {
        subject: readString(item, "subject"),
      });
    case "support_ticket_status_changed": {
      const status = readString(item, "status");
      return t("notifications:types.support_ticket_status_changed", {
        subject: readString(item, "subject"),
        status: t(`notifications:ticketStatus.${status}`, status),
      });
    }
    case "admin_permissions_changed":
      return t(
        `notifications:actions.${readString(item, "action")}`,
        t("notifications:types.admin_permissions_changed"),
      );
  }
};

const NotificationRow = ({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}) => {
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

const NotificationBellInner = () => {
  useNotificationRealtime();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const [open, setOpen] = useState(false);

  const { data: unread } = useUnreadCount();
  const { data: list, isLoading } = useNotifications({ limit: PANEL_LIMIT });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unread?.unread_count ?? 0;
  const items = list?.data ?? [];

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read_at) {
      markRead.mutate(item.id);
    }
    const ticketId = readString(item, "ticket_id");
    if (ticketId && item.type !== "admin_permissions_changed") {
      setOpen(false);
      router.push(getLocalizedPath(`${ROUTES.support}/${ticketId}`, currentLocale));
    }
  };

  let panelBody = (
    <div className="space-y-2 px-3 py-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
  if (!isLoading) {
    panelBody =
      items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-3 py-8 text-muted-foreground">
          <Inbox className="h-6 w-6" />
          <span className="text-sm">{t("notifications:empty")}</span>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} onClick={handleItemClick} />
          ))}
        </>
      );
  }

  const panel = (
    <div className="w-80 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-sm font-semibold">{t("notifications:title")}</span>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              markAllRead.mutate();
            }}
            loading={markAllRead.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("notifications:markAllRead")}
          </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">{panelBody}</div>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => panel}
    >
      <span>
        <Button variant="ghost" className="w-9 px-0" aria-label={t("notifications:bell")}>
          <Badge count={unreadCount} size="small" offset={[2, -2]}>
            <Bell className="h-4 w-4" />
          </Badge>
        </Button>
      </span>
    </Dropdown>
  );
};

// Outer gate: render nothing (and run no notification queries or socket) for
// guests. The inner component only mounts once the user is authenticated.
export const NotificationBell = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return null;
  return <NotificationBellInner />;
};
