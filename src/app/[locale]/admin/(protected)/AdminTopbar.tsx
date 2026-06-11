"use client";

import { ChevronRight, PanelLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NotificationBell } from "@/components/common/NotificationBell";
import { Button } from "@/components/ui/button";

interface AdminTopbarProps {
  onToggleSidebar: () => void;
  sectionKey: string | null;
  itemKey: string | null;
}

export function AdminTopbar({ onToggleSidebar, sectionKey, itemKey }: AdminTopbarProps) {
  const { t } = useTranslation("admin");

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggleSidebar}
        aria-label={t("shell.toggleSidebar")}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      <nav className="flex items-center gap-1.5 text-sm" aria-label={t("shell.breadcrumb")}>
        <span className="font-medium text-muted-foreground">{t("shell.title")}</span>
        {sectionKey ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-muted-foreground">{t(`shell.section.${sectionKey}`)}</span>
          </>
        ) : null}
        {itemKey ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="font-medium text-foreground">{t(`shell.nav.${itemKey}`)}</span>
          </>
        ) : null}
      </nav>
      <div className="flex-1" />
      <NotificationBell />
    </header>
  );
}
