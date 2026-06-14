"use client";

import { useState } from "react";

import { Drawer, Modal } from "antd";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useActiveAnnouncement } from "@/hooks/api/use-broadcasts";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { dismissAnnouncement, isAnnouncementDismissed } from "@/lib/announcement-dismissed";
import { announcementBody, announcementTitle } from "@/lib/announcement-render";
import { getPathWithoutLocale, isAdminPath, matchesRoute, ROUTES } from "@/lib/config/routes";
import { fadeDown } from "@/lib/motion/variants";
import type { AnnouncementLevel } from "@/lib/types/announcement";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

const LEVEL_BG: Record<AnnouncementLevel, string> = {
  info: "bg-primary/10",
  warning: "bg-amber-500/15",
  critical: "bg-destructive/15",
};

interface ViewProps {
  level: AnnouncementLevel;
  title: string;
  body: string;
  onDismiss: () => void;
}

function BannerStrip({ level, title, body, onDismiss }: ViewProps) {
  const { t } = useTranslation("broadcasts");
  const reduce = useReducedMotion();
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <>
      <motion.div
        variants={reduce ? undefined : fadeDown}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "visible"}
        className={cn("flex w-full items-center gap-3 px-4 py-2 text-sm sm:px-6", LEVEL_BG[level])}
      >
        <span className="min-w-0 flex-1 truncate">
          <span className="font-semibold text-foreground">{title}</span>
          {body ? <span className="text-muted-foreground"> — {body}</span> : null}
        </span>
        {body ? (
          <button
            type="button"
            onClick={() => {
              setDetailOpen(true);
            }}
            className="shrink-0 text-xs font-medium text-foreground underline-offset-2 hover:underline"
          >
            {t("banner.details")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("banner.dismiss")}
          className="shrink-0 rounded-md p-1 transition-colors hover:bg-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
      <Modal
        open={detailOpen}
        title={title}
        footer={null}
        onCancel={() => {
          setDetailOpen(false);
        }}
      >
        <p className="text-sm whitespace-pre-line text-muted-foreground">{body}</p>
      </Modal>
    </>
  );
}

function BannerSheet({ level, title, body, onDismiss }: ViewProps) {
  const { t } = useTranslation("broadcasts");
  return (
    <Drawer open placement="bottom" closable={false} onClose={onDismiss}>
      <div className={cn("space-y-3 rounded-xl p-1", LEVEL_BG[level])}>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm whitespace-pre-line text-muted-foreground">{body}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {t("banner.dismiss")}
      </button>
    </Drawer>
  );
}

export function AnnouncementBanner() {
  const { t, i18n } = useTranslation("broadcasts");
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isMobile = useIsMobile();
  const { data } = useActiveAnnouncement(isAuthenticated);

  // The id the user closed this session; combined with the persisted set below
  // so a fresh announcement (new id) reappears while a closed one stays hidden.
  const [closedId, setClosedId] = useState<string | null>(null);

  const announcement = data?.announcement ?? null;
  // The admin shell + suspended page own their chrome, so the banner stays off
  // those surfaces (mirrors AppHeader).
  const path = getPathWithoutLocale(pathname);
  const chromeFree = isAdminPath(path) || matchesRoute(path, ROUTES.accountSuspended);

  if (!announcement || chromeFree) return null;
  if (closedId === announcement.id || isAnnouncementDismissed(announcement.id)) return null;

  const lang = (i18n.language.split("-")[0] ?? "en") as "en" | "tr";
  const title = announcementTitle(t, lang, announcement);
  const body = announcementBody(t, lang, announcement);
  const onDismiss = () => {
    dismissAnnouncement(announcement.id);
    setClosedId(announcement.id);
  };

  const view: ViewProps = { level: announcement.level, title, body, onDismiss };
  return isMobile ? <BannerSheet {...view} /> : <BannerStrip {...view} />;
}
