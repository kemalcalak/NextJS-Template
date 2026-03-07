"use client";

import { useState, useEffect } from "react";

import { Moon, Sun, Menu, User as UserIcon, LogOut, Globe, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuthStore } from "@/stores/auth.store";

interface AppDrawerProps {
  theme: string;
  toggleTheme: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const SettingsSection = ({
  theme,
  toggleTheme,
  changeLanguage,
}: {
  theme: string;
  toggleTheme: () => void;
  changeLanguage: (lng: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
        {t("common:ui.settings", "Settings")}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          aria-label={
            mounted && theme === "dark"
              ? t("common:ui.light", "Light")
              : t("common:ui.dark", "Dark")
          }
          className="flex h-auto items-center justify-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 hover:border-border/60 transition-all text-left"
        >
          <div className="shrink-0 p-1.5 rounded-lg bg-background shadow-sm border border-border/50">
            {mounted && theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-orange-500" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-blue-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-muted-foreground leading-none mb-1">
              {t("common:ui.theme", "Theme")}
            </span>
            <span className="text-xs font-bold truncate">
              {mounted && theme === "dark"
                ? t("common:ui.light", "Light")
                : t("common:ui.dark", "Dark")}
            </span>
          </div>
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          onClick={() => {
            const nextLang = i18n.language.startsWith("tr") ? "en" : "tr";
            changeLanguage(nextLang);
          }}
          aria-label={t("common:ui.language", "Language")}
          className="flex h-auto items-center justify-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 hover:border-border/60 transition-all text-left"
        >
          <div className="shrink-0 p-1.5 rounded-lg bg-background shadow-sm border border-border/50">
            <Globe className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-muted-foreground leading-none mb-1">
              {t("common:ui.language", "Language")}
            </span>
            <span className="text-xs font-bold truncate uppercase">
              {i18n.language.split("-")[0]}
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export const AppDrawer = ({
  theme,
  toggleTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: AppDrawerProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    router.push("/logout");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.cookie = `NEXT_LOCALE=${lng}; path=/; max-age=31536000; SameSite=Lax`;
    setIsMobileMenuOpen(false);

    // Redirect to the new locale URL
    const currentPath = window.location.pathname;
    let newPath: string;
    if (currentPath.startsWith("/en/") || currentPath === "/en") {
      newPath = currentPath.replace(/^\/en/, `/${lng}`);
    } else if (currentPath.startsWith("/tr/") || currentPath === "/tr") {
      newPath = currentPath.replace(/^\/tr/, `/${lng}`);
    } else {
      newPath = `/${lng}${currentPath}`;
    }

    window.location.href = newPath || `/${lng}`;
  };

  return (
    <Drawer direction="left" open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("common:ui.toggleMenu", "Toggle Menu")}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="right-auto top-0 mt-0 h-screen w-[85vw] max-w-sm rounded-none border-r"
        aria-describedby={undefined}
      >
        {/* Hide the default handle bar visually from the drawer */}
        <style>{`
                    [data-vaul-drawer-direction="left"] .mx-auto.mt-4.h-2.w-\\[100px\\] {
                        display: none;
                    }
                `}</style>
        <DrawerHeader className="text-left border-b pb-6 px-6 pt-8">
          <DrawerTitle className="text-2xl font-bold tracking-tight text-primary">
            NextJS Template
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
          {/* User Profile Section (if logged in) */}
          {user && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border">
              <Avatar className="h-12 w-12 border shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`}
                  alt={user.email}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.first_name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation Section */}
          {user && (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start h-11 rounded-xl font-medium"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/dashboard");
                }}
              >
                <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                {t("common:nav.dashboard", "Dashboard")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-11 rounded-xl font-medium"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/profile");
                }}
              >
                <UserIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                {t("common:nav.profile", "Profile")}
              </Button>
            </div>
          )}

          {/* Actions Section */}
          <div className="mt-auto pt-6 border-t flex flex-col gap-6">
            <SettingsSection
              theme={theme}
              toggleTheme={toggleTheme}
              changeLanguage={changeLanguage}
            />

            {!user ? (
              <div className="flex gap-3 w-full">
                <Button
                  className="flex-1 justify-center h-11 text-base font-medium rounded-xl shadow-sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/login");
                  }}
                >
                  {t("auth:login.submitButton", "Login")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 justify-center h-11 text-base font-medium rounded-xl"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/register");
                  }}
                >
                  {t("auth:register.submitButton", "Register")}
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                className="w-full justify-start h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium border-0 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 px-3"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("auth:logout.logoutButton", "Log out")}
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
