"use client";

import { Drawer } from "antd";
import {
  Menu,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Home,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useLanguage } from "@/hooks/use-language";
import {
  getLocaleFromPath,
  getPathWithoutLocale,
  ROUTES,
  getLocalizedPath,
  matchesRoute,
} from "@/lib/config/routes";
import { SystemRole } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { useAuthStore, type User } from "@/stores/auth.store";

import { SettingsSection } from "./AppDrawerSettings";

interface AppDrawerProps {
  theme: string;
  toggleTheme: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

interface UserProfileProps {
  user: NonNullable<User>;
}

const UserProfile = ({ user }: UserProfileProps) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border">
    <Avatar className="h-12 w-12 border shadow-sm">
      {user.avatar_file?.url && <AvatarImage src={user.avatar_file.url} alt={user.email} />}
      <AvatarFallback className="bg-primary/10 text-primary">
        {user.first_name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col flex-1 overflow-hidden">
      <p className="text-base font-bold truncate">
        {user.first_name} {user.last_name}
      </p>
    </div>
  </div>
);

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: (href: string) => void;
}

const NavLink = ({ href, icon: Icon, label, active, onClick }: NavLinkProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    className={cn(
      "w-full justify-start h-11 rounded-xl font-medium transition-all px-4",
      active && "bg-primary/10! text-primary! hover:bg-primary/15!",
    )}
    onClick={() => {
      onClick(href);
    }}
  >
    <span className="flex w-full items-center">
      <Icon className={cn("mr-3 h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
      {label}
    </span>
  </Button>
);

// Nav links shown only to authenticated users. Extracted so the AppDrawer
// component itself stays under the max-lines-per-function budget.
interface AuthedNavLinksProps {
  user: NonNullable<User>;
  isActive: (path: string) => boolean;
  navigate: (href: string) => void;
}

const AuthedNavLinks = ({ user, isActive, navigate }: AuthedNavLinksProps) => {
  const { t } = useTranslation();
  return (
    <>
      {user.role === SystemRole.ADMIN && (
        <NavLink
          href={ROUTES.adminDashboard}
          icon={ShieldCheck}
          label={t("admin:shell.title", "Administration")}
          active={isActive(ROUTES.adminDashboard)}
          onClick={navigate}
        />
      )}
      <NavLink
        href={ROUTES.dashboard}
        icon={LayoutDashboard}
        label={t("common:nav.dashboard")}
        active={isActive(ROUTES.dashboard)}
        onClick={navigate}
      />
      <NavLink
        href={ROUTES.profile}
        icon={UserIcon}
        label={t("common:nav.profile")}
        active={isActive(ROUTES.profile)}
        onClick={navigate}
      />
      <NavLink
        href={ROUTES.support}
        icon={LifeBuoy}
        label={t("common:nav.support")}
        active={isActive(ROUTES.support)}
        onClick={navigate}
      />
    </>
  );
};

export const AppDrawer = ({
  theme,
  toggleTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: AppDrawerProps) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { changeLanguage } = useLanguage();

  const isActive = (path: string) => {
    const currentPath = getPathWithoutLocale(pathname);
    return matchesRoute(currentPath, path);
  };

  const navigate = (href: string) => {
    setIsMobileMenuOpen(false);
    const currentLocale = getLocaleFromPath(pathname);
    router.push(getLocalizedPath(href, currentLocale));
  };

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng, () => {
      setIsMobileMenuOpen(false);
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        className="h-auto px-0 md:hidden"
        onClick={() => {
          setIsMobileMenuOpen(true);
        }}
      >
        <span className="flex rounded-lg border border-border/50 bg-background p-1.5 shadow-sm">
          <Menu className="h-5 w-5 text-foreground" />
        </span>
        <span className="sr-only">{t("common:ui.toggleMenu")}</span>
      </Button>
      <Drawer
        open={isMobileMenuOpen}
        onClose={() => {
          setIsMobileMenuOpen(false);
        }}
        placement="left"
        closable={false}
        styles={{
          wrapper: { width: "85vw", maxWidth: "24rem" },
          section: { background: "var(--background)" },
          body: { padding: 0 },
          header: {
            padding: "2rem 1.5rem 1.5rem",
            background: "var(--background)",
            borderBottom: "1px solid var(--border)",
          },
        }}
        title={
          <span className="text-2xl font-bold tracking-tight text-primary">
            {env.NEXT_PUBLIC_APP_NAME}
          </span>
        }
        classNames={{ wrapper: "max-w-sm" }}
      >
        <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto bg-background text-foreground">
          {user && <UserProfile user={user} />}

          <div className="flex flex-col gap-3">
            <NavLink
              href={ROUTES.home}
              icon={Home}
              label={t("common:nav.home")}
              active={isActive(ROUTES.home)}
              onClick={navigate}
            />
            {user && <AuthedNavLinks user={user} isActive={isActive} navigate={navigate} />}
          </div>

          <div className="mt-auto pt-6 border-t flex flex-col gap-6 pb-6">
            <SettingsSection
              theme={theme}
              toggleTheme={toggleTheme}
              changeLanguage={handleLanguageChange}
            />
            {!user ? (
              <div className="flex gap-3 w-full">
                <Button
                  className="flex-1 h-11 text-base rounded-xl"
                  onClick={() => {
                    navigate(ROUTES.login);
                  }}
                >
                  {t("auth:login.submitButton")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-base rounded-xl"
                  onClick={() => {
                    navigate(ROUTES.register);
                  }}
                >
                  {t("auth:register.submitButton")}
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                className="w-full justify-start h-11 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 dark:bg-red-950/30 dark:text-red-400"
                onClick={() => {
                  navigate(ROUTES.logout);
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                {t("auth:logout.logoutButton")}
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};
