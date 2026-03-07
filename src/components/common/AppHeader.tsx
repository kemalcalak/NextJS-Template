"use client";

import { useState, useEffect } from "react";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AppDrawer } from "@/components/common/AppDrawer";
import { AuthButtons } from "@/components/common/AuthButtons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/stores/auth.store";

export const AppHeader = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.cookie = `NEXT_LOCALE=${lng}; path=/; max-age=31536000; SameSite=Lax`;
    setIsMobileMenuOpen(false);

    // Redirect to the new locale URL
    const currentPath = window.location.pathname;
    let newPath = currentPath;
    if (currentPath.startsWith("/en/") || currentPath === "/en") {
      newPath = currentPath.replace(/^\/en/, `/${lng}`);
    } else if (currentPath.startsWith("/tr/") || currentPath === "/tr") {
      newPath = currentPath.replace(/^\/tr/, `/${lng}`);
    } else {
      newPath = `/${lng}${currentPath}`;
    }

    // Fallback to exactly /lng
    window.location.href = newPath || `/${lng}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h2 className="text-lg font-semibold tracking-tight cursor-pointer">NextJS Template</h2>
          </Link>
        </div>

        <div className="flex-1" />

        <AppDrawer
          theme={resolvedTheme || theme || "light"}
          toggleTheme={toggleTheme}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="w-9 px-0" onClick={toggleTheme}>
            {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">{t("common:ui.toggleTheme", "Toggle theme")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 px-0">
                {i18n.language.startsWith("tr") ? "TR" : "EN"}
                <span className="sr-only">{t("common:ui.toggleLanguage", "Toggle language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  changeLanguage("en");
                }}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  changeLanguage("tr");
                }}
              >
                Türkçe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AuthButtons user={user} />
        </div>
      </div>
    </header>
  );
};
