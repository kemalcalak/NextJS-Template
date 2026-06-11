"use client";

import { useMemo, useState } from "react";

import { Segmented } from "antd";
import { CheckCheck, Inbox } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { AdminPagination } from "@/components/admin/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/components/admin/pagination-config";
import { notificationTargetPath, notificationText } from "@/components/common/notification-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/api/use-notifications";
import {
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  isAdminPath,
} from "@/lib/config/routes";
import { formatDateTime } from "@/lib/format-date";
import type { NotificationItem } from "@/lib/types/notification";
import { cn } from "@/lib/utils";

type ReadFilter = "all" | "unread";

const InboxRow = ({
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
      className="flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-muted last:border-b-0"
    >
      <span
        className={cn(
          "mt-2 h-2 w-2 shrink-0 rounded-full",
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

export function NotificationsView() {
  const { t } = useTranslation("notifications");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const isAdmin = isAdminPath(getPathWithoutLocale(pathname));

  const [filter, setFilter] = useState<ReadFilter>("all");
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const params = useMemo(
    () => ({
      skip,
      limit: pageSize,
      unread_only: filter === "unread" ? true : undefined,
    }),
    [skip, pageSize, filter],
  );

  const { data, isLoading, isFetching } = useNotifications(params);
  const { data: unread } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unread?.unread_count ?? 0;
  const items = data?.data ?? [];

  const filterOptions = [
    { label: t("page.filterAll"), value: "all" },
    { label: t("page.filterUnread"), value: "unread" },
  ];

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read_at) {
      markRead.mutate(item.id);
    }
    const target = notificationTargetPath(item, isAdmin);
    if (target) {
      router.push(getLocalizedPath(target, currentLocale));
    }
  };

  let body = (
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
  if (!isLoading || data) {
    body =
      items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-12 text-muted-foreground">
          <Inbox className="h-7 w-7" />
          <span className="text-sm">{t("empty")}</span>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <InboxRow key={item.id} item={item} onClick={handleItemClick} />
          ))}
        </>
      );
  }

  return (
    <Card className="border-border/50 bg-card/60">
      <CardContent className="p-0">
        {/* Toolbar: read filter left, bulk action right; stacked on mobile. */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            options={filterOptions}
            value={filter}
            onChange={(value) => {
              setFilter(value as ReadFilter);
              setSkip(0);
            }}
          />
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                markAllRead.mutate();
              }}
              loading={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              {t("markAllRead")}
            </Button>
          )}
        </div>

        {body}

        {data ? (
          <div
            className="px-4 pb-4 pt-2"
            aria-live="polite"
            aria-busy={isFetching ? "true" : "false"}
          >
            <AdminPagination
              total={data.total}
              skip={data.skip}
              limit={data.limit}
              onChange={setSkip}
              onPageSizeChange={(next) => {
                setPageSize(next);
                setSkip(0);
              }}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
