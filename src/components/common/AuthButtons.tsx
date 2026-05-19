"use client";

import { Dropdown, type MenuProps } from "antd";
import { LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getLocaleFromPath, ROUTES, getLocalizedPath } from "@/lib/config/routes";
import { SystemRole } from "@/lib/types/user";
import type { User } from "@/stores/auth.store";

interface AuthButtonsProps {
  user: User | null;
  onNavigate?: () => void;
}

export const AuthButtons = ({ user, onNavigate }: AuthButtonsProps) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const router = useRouter();

  const navigate = (path: string) => {
    onNavigate?.();
    router.push(getLocalizedPath(path, currentLocale));
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link
            href={getLocalizedPath(ROUTES.login, currentLocale)}
            onClick={() => {
              onNavigate?.();
            }}
          >
            {t("auth:login.submitButton", "Login")}
          </Link>
        </Button>
        <Button asChild>
          <Link
            href={getLocalizedPath(ROUTES.register, currentLocale)}
            onClick={() => {
              onNavigate?.();
            }}
          >
            {t("auth:register.submitButton", "Register")}
          </Link>
        </Button>
      </div>
    );
  }

  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : t("common:ui.userFallback", "User");

  const items: MenuProps["items"] = [
    {
      key: "name",
      label: <span className="text-base font-semibold">{fullName}</span>,
      disabled: true,
    },
    { type: "divider" },
    ...(user.role === SystemRole.ADMIN
      ? [
          {
            key: "admin",
            icon: <ShieldCheck className="h-4 w-4 text-primary" />,
            label: t("admin:shell.title", "Administration"),
            onClick: () => {
              navigate(ROUTES.adminDashboard);
            },
          },
        ]
      : []),
    {
      key: "dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: t("common:nav.dashboard", "Dashboard"),
      onClick: () => {
        navigate(ROUTES.dashboard);
      },
    },
    {
      key: "profile",
      icon: <UserIcon className="h-4 w-4" />,
      label: t("common:nav.profile", "Profile"),
      onClick: () => {
        navigate(ROUTES.profile);
      },
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut className="h-4 w-4" />,
      label: t("auth:logout.logoutButton", "Log out"),
      danger: true,
      onClick: () => {
        navigate(ROUTES.logout);
      },
    },
  ];

  return (
    <Dropdown
      menu={{ items, style: { minWidth: 224 } }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <span>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`}
              alt={user.email}
            />
            <AvatarFallback>
              {user.first_name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </span>
    </Dropdown>
  );
};
