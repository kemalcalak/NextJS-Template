"use client";

import { useEffect } from "react";

import { Activity, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import {
  ROUTES,
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  matchesRoute,
} from "@/lib/config/routes";
import { SystemRole } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { t } = useTranslation("admin");
  // Fine-grained selectors so unrelated store fields (e.g. isLoading) don't
  // re-render the admin shell on every auth-tick.
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionInitialized = useAuthStore((state) => state.isSessionInitialized);
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocaleFromPath(pathname);
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  // Kick non-admin users back to the regular dashboard. We can only run this
  // check once AuthHydrator has populated the store with /users/me — the
  // server-side cookie check in layout.tsx does not include the role.
  useEffect(() => {
    if (!isSessionInitialized) return;
    if (!isAuthenticated) return;
    if (user && user.role !== SystemRole.ADMIN) {
      router.replace(getLocalizedPath(ROUTES.dashboard, currentLocale));
    }
  }, [isSessionInitialized, isAuthenticated, user, router, currentLocale]);

  if (!isSessionInitialized || !isAuthenticated || !user) {
    return <LoadingScreen />;
  }

  if (user.role !== SystemRole.ADMIN) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{t("shell.forbiddenTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("shell.forbiddenDescription")}</p>
          <Button
            className="mt-4"
            onClick={() => {
              router.replace(getLocalizedPath(ROUTES.dashboard, currentLocale));
            }}
          >
            {t("shell.forbiddenCta")}
          </Button>
        </div>
      </div>
    );
  }

  const nav = [
    {
      key: "dashboard",
      label: t("shell.nav.dashboard"),
      href: ROUTES.adminDashboard,
      icon: LayoutDashboard,
    },
    {
      key: "users",
      label: t("shell.nav.users"),
      href: ROUTES.adminUsers,
      icon: Users,
    },
    {
      key: "activities",
      label: t("shell.nav.activities"),
      href: ROUTES.adminActivities,
      icon: Activity,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:flex-row md:p-6 lg:p-8">
      <aside className="md:sticky md:top-24 md:h-fit md:w-56 md:shrink-0">
        <div className="mb-4 flex items-center gap-2 px-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            {t("shell.title")}
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto rounded-xl border bg-card/50 p-1 md:flex-col md:overflow-visible">
          {nav.map((item) => {
            const href = getLocalizedPath(item.href, currentLocale);
            const active = matchesRoute(pathWithoutLocale, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
