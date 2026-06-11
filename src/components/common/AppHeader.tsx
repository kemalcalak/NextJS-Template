"use client";

import { useState, useEffect } from "react";

import { Dropdown, type MenuProps } from "antd";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { AppDrawer } from "@/components/common/AppDrawer";
import { AuthButtons } from "@/components/common/AuthButtons";
import { NotificationBell } from "@/components/common/NotificationBell";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  ROUTES,
  getLocalizedPath,
  getLocaleFromPath,
  getPathWithoutLocale,
  isAdminPath,
  matchesRoute,
} from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

export const AppHeader = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const { changeLanguage } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // The entire admin area has its own chrome (AdminShell: sidebar + topbar), so
  // the public header must never appear on any /admin/* route — including the
  // admin login, which is a dedicated chrome-free surface.
  // The /account-suspended page is also chrome-free: a suspended user must
  // not have any nav affordance to bounce around the app — only the in-page
  // logout button.
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  if (isAdminPath(pathWithoutLocale) || matchesRoute(pathWithoutLocale, ROUTES.accountSuspended)) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleChangeLanguage = (lng: string) => {
    changeLanguage(lng, () => {
      setIsMobileMenuOpen(false);
    });
  };

  const languageItems: MenuProps["items"] = [
    {
      key: "en",
      label: "English",
      onClick: () => {
        handleChangeLanguage("en");
      },
    },
    {
      key: "tr",
      label: "Türkçe",
      onClick: () => {
        handleChangeLanguage("tr");
      },
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto flex h-16 w-full max-w-480 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={getLocalizedPath(ROUTES.home, currentLocale)}
            className="hover:opacity-80 transition-opacity"
          >
            <h2 className="text-lg font-semibold tracking-tight cursor-pointer">
              {env.NEXT_PUBLIC_APP_NAME}
            </h2>
          </Link>
        </div>

        <div className="flex-1" />

        <NotificationBell />

        {mounted && isMobile && (
          <AppDrawer
            theme={resolvedTheme || theme || "light"}
            toggleTheme={toggleTheme}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        )}

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="w-9 px-0" onClick={toggleTheme}>
            <span className="flex rounded-lg border border-border/50 bg-background p-1.5 shadow-sm">
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-orange-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-blue-500" />
              )}
            </span>
            <span className="sr-only">{t("common:ui.toggleTheme", "Toggle theme")}</span>
          </Button>

          <Dropdown menu={{ items: languageItems }} trigger={["click"]} placement="bottomRight">
            <span>
              <Button variant="ghost" className="w-9 px-0">
                {currentLocale.toUpperCase()}
                <span className="sr-only">{t("common:ui.toggleLanguage", "Toggle language")}</span>
              </Button>
            </span>
          </Dropdown>

          <AuthButtons user={user} />
        </div>
      </div>
    </header>
  );
};
