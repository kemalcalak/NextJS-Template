"use client";

import { Dropdown, type MenuProps, Tooltip } from "antd";
import { LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { SettingsSection } from "@/components/common/AppDrawerSettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { getLocalizedPath, ROUTES } from "@/lib/config/routes";
import type { User } from "@/stores/auth.store";

interface AdminSidebarFooterProps {
  user: NonNullable<User>;
  currentLocale: string;
  collapsed: boolean;
}

// User block + theme / language / logout controls. Split out of AdminSidebar to
// keep both components under the max-lines budget. Renders an icon-only column
// when collapsed and a labelled row when expanded.
export function AdminSidebarFooter({ user, currentLocale, collapsed }: AdminSidebarFooterProps) {
  const { t } = useTranslation(["admin", "common", "auth"]);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { changeLanguage } = useLanguage();

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

  const languageItems: MenuProps["items"] = [
    {
      key: "en",
      label: "English",
      onClick: () => {
        changeLanguage("en");
      },
    },
    {
      key: "tr",
      label: "Türkçe",
      onClick: () => {
        changeLanguage("tr");
      },
    },
  ];

  const themeToggle = (
    <Button
      variant="ghost"
      className="w-9 px-0"
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
      aria-label={t("common:ui.toggleTheme", "Toggle theme")}
    >
      <span className="flex rounded-lg border border-border/50 bg-background p-1.5 shadow-sm">
        {resolvedTheme === "dark" ? (
          <Sun className="h-3.5 w-3.5 text-orange-500" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-blue-500" />
        )}
      </span>
    </Button>
  );

  const languageToggle = (
    <Dropdown menu={{ items: languageItems }} trigger={["click"]} placement="topLeft">
      <span>
        <Button
          variant="ghost"
          className="w-9 px-0"
          aria-label={t("common:ui.toggleLanguage", "Toggle language")}
        >
          {currentLocale.toUpperCase()}
        </Button>
      </span>
    </Dropdown>
  );

  const logoutBox = (
    <span className="flex rounded-lg border border-border/50 bg-background p-1.5 shadow-sm">
      <LogOut className="h-3.5 w-3.5 text-red-500" />
    </span>
  );

  const goLogout = () => {
    router.push(getLocalizedPath(ROUTES.logout, currentLocale));
  };

  const avatar = (
    <Avatar className="h-8 w-8">
      {user.avatar_file?.url && <AvatarImage src={user.avatar_file.url} alt={user.email} />}
      <AvatarFallback className="text-xs uppercase">
        {(user.first_name?.[0] ?? user.email[0]).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-border/60 p-2">
        {avatar}
        <Tooltip title={t("common:ui.toggleTheme", "Toggle theme")} placement="right">
          {themeToggle}
        </Tooltip>
        {languageToggle}
        <Tooltip title={t("auth:logout.logoutButton", "Log out")} placement="right">
          <Button
            variant="ghost"
            className="w-9 px-0"
            aria-label={t("auth:logout.logoutButton", "Log out")}
            onClick={goLogout}
          >
            {logoutBox}
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-border/60 p-3">
      <div className="flex items-center gap-3 rounded-xl border bg-muted/50 p-3">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <SettingsSection
        theme={resolvedTheme ?? "light"}
        toggleTheme={() => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }}
        changeLanguage={(lng) => {
          changeLanguage(lng);
        }}
      />
      <Button
        variant="destructive"
        className="h-11 w-full justify-start rounded-xl bg-red-50 px-3 font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
        onClick={goLogout}
      >
        <LogOut className="mr-3 h-4 w-4" />
        {t("auth:logout.logoutButton", "Log out")}
      </Button>
    </div>
  );
}
