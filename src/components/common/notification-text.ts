import i18n from "@/i18n/config";
import { announcementBody, type AnnouncementFields } from "@/lib/announcement-render";
import { ROUTES } from "@/lib/config/routes";
import type { AnnouncementLanguage } from "@/lib/types/announcement";
import type { NotificationItem } from "@/lib/types/notification";

import type { TFunction } from "i18next";

export const readNotificationString = (item: NotificationItem, key: string): string => {
  const value = item.data[key];
  return typeof value === "string" ? value : "";
};

// Map a stored notification (type + data payload) to a translated message.
// The backend persists no human-readable text, so this is the single place
// where notification copy is produced — shared by the bell panel and the
// full inbox page.
export const notificationText = (t: TFunction, item: NotificationItem): string => {
  switch (item.type) {
    case "support_ticket_replied":
      return t("notifications:types.support_ticket_replied", {
        subject: readNotificationString(item, "subject"),
      });
    case "support_ticket_status_changed": {
      const status = readNotificationString(item, "status");
      return t("notifications:types.support_ticket_status_changed", {
        subject: readNotificationString(item, "subject"),
        status: t(`notifications:ticketStatus.${status}`, status),
      });
    }
    case "admin_permissions_changed":
      return t(
        `notifications:actions.${readNotificationString(item, "action")}`,
        t("notifications:types.admin_permissions_changed"),
      );
    case "admin_announcement": {
      const lang = (i18n.language.split("-")[0] ?? "en") as AnnouncementLanguage;
      return announcementBody(t, lang, {
        kind: readNotificationString(item, "kind") || "custom",
        template_key: readNotificationString(item, "template_key") || null,
        variables: item.data.variables as AnnouncementFields["variables"],
        translations: item.data.translations as AnnouncementFields["translations"],
      });
    }
  }
};

// Locale-less path a notification links to, or null when it has no target.
// Admins are confined to the admin shell (AuthHydrator bounces them off every
// non-admin route), so their ticket links must use the admin detail page.
export const notificationTargetPath = (item: NotificationItem, isAdmin: boolean): string | null => {
  const ticketId = readNotificationString(item, "ticket_id");
  if (!ticketId || item.type === "admin_permissions_changed" || item.type === "admin_announcement")
    return null;
  return `${isAdmin ? ROUTES.adminSupport : ROUTES.support}/${ticketId}`;
};
