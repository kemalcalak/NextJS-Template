import {
  Activity,
  Bell,
  CircleUser,
  Images,
  LayoutDashboard,
  Ticket,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/lib/config/routes";

// Grouped admin navigation. Labels are resolved in the components via i18n
// (`shell.nav.<key>` / `shell.section.<key>`); this module stays a pure,
// hook-free builder so it can be unit-tested and shared by the sidebar + topbar.
export interface AdminNavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  show: boolean;
}

export interface AdminNavSection {
  key: string;
  items: AdminNavItem[];
}

export interface AdminNavCaps {
  canReadUsers: boolean;
  canReadFiles: boolean;
  canReadActivities: boolean;
  canReadSupport: boolean;
  isSuperadmin: boolean;
}

export const buildAdminNav = (caps: AdminNavCaps): AdminNavSection[] => {
  const sections: AdminNavSection[] = [
    {
      key: "overview",
      items: [{ key: "dashboard", href: ROUTES.adminDashboard, icon: LayoutDashboard, show: true }],
    },
    {
      key: "management",
      items: [
        { key: "users", href: ROUTES.adminUsers, icon: Users, show: caps.canReadUsers },
        { key: "admins", href: ROUTES.adminAdmins, icon: UserCog, show: caps.isSuperadmin },
        { key: "files", href: ROUTES.adminFiles, icon: Images, show: caps.canReadFiles },
      ],
    },
    {
      key: "monitoring",
      items: [
        {
          key: "activities",
          href: ROUTES.adminActivities,
          icon: Activity,
          show: caps.canReadActivities,
        },
        { key: "support", href: ROUTES.adminSupport, icon: Ticket, show: caps.canReadSupport },
      ],
    },
    {
      key: "account",
      items: [
        // Personal inbox — every admin sees their own, so no permission gate.
        {
          key: "notifications",
          href: ROUTES.adminNotifications,
          icon: Bell,
          show: true,
        },
        { key: "profile", href: ROUTES.adminProfile, icon: CircleUser, show: true },
      ],
    },
  ];

  // Drop hidden items and any section left empty so the sidebar never renders a
  // bare section header with no links under it.
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.show) }))
    .filter((section) => section.items.length > 0);
};
