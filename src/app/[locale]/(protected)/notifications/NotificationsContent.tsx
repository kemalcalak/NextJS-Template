"use client";

import { useTranslation } from "react-i18next";

import { NotificationsView } from "@/components/notifications/NotificationsView";

export function NotificationsContent() {
  const { t } = useTranslation("notifications");

  return (
    <div className="mx-auto w-full max-w-480 space-y-6 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("page.subtitle")}</p>
      </div>
      <NotificationsView />
    </div>
  );
}
