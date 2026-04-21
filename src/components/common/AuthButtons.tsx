"use client";

import { LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleLogout = () => {
    onNavigate?.();
    router.push(getLocalizedPath(ROUTES.logout, currentLocale));
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-semibold leading-none">
              {user.first_name || user.last_name
                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                : t("common:ui.userFallback", "User")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === SystemRole.ADMIN ? (
          <DropdownMenuItem asChild>
            <Link
              href={getLocalizedPath(ROUTES.adminDashboard, currentLocale)}
              onClick={() => {
                onNavigate?.();
              }}
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
              <span>{t("admin:shell.title", "Administration")}</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link
            href={getLocalizedPath(ROUTES.dashboard, currentLocale)}
            onClick={() => {
              onNavigate?.();
            }}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t("common:nav.dashboard", "Dashboard")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={getLocalizedPath(ROUTES.profile, currentLocale)}
            onClick={() => {
              onNavigate?.();
            }}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t("common:nav.profile", "Profile")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("auth:logout.logoutButton", "Log out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
