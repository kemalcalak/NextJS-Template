"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { authService } from "@/lib/api/endpoints/auth";
import {
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  matchesRoute,
  pendingDeletionRoutes,
  protectedRoutes,
  ROUTES,
} from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { user, setUser, setSessionInitialized, isSessionInitialized, isAuthenticated } =
    useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const fetched = await authService.getMe();
        setUser(fetched);
      } catch {
        // Not logged in or error
        setUser(null);
      } finally {
        setSessionInitialized(true);
      }
    };

    if (!isSessionInitialized) {
      void hydrate();
    }
  }, [setUser, setSessionInitialized, isSessionInitialized]);

  // Check for redirects after initialization
  useEffect(() => {
    if (!isSessionInitialized) return;

    const pathWithoutLocale = getPathWithoutLocale(pathname);
    const currentLocale = getLocaleFromPath(pathname);
    const isProtectedRoute = protectedRoutes.some((route) =>
      matchesRoute(pathWithoutLocale, route),
    );
    const isPendingDeletionRoute = pendingDeletionRoutes.some((route) =>
      matchesRoute(pathWithoutLocale, route),
    );

    if (!isAuthenticated) {
      if (isProtectedRoute || isPendingDeletionRoute) {
        router.replace(`${getLocalizedPath(ROUTES.login, currentLocale)}?session_expired=true`);
      }
      return;
    }

    // Route deactivated users to the cancel-deletion screen; keep active users
    // out of it. The proxy can't make this decision because it only sees the
    // JWT, not the user's deletion_scheduled_at field.
    const isPendingDeletion = Boolean(user?.deletion_scheduled_at);
    if (isPendingDeletion && !isPendingDeletionRoute) {
      router.replace(getLocalizedPath(ROUTES.accountDeactivated, currentLocale));
    } else if (!isPendingDeletion && isPendingDeletionRoute) {
      router.replace(getLocalizedPath(ROUTES.dashboard, currentLocale));
    }
  }, [isSessionInitialized, isAuthenticated, user, pathname, router]);

  // While hydrating, don't show children for protected routes. This gate
  // also covers pendingDeletionRoutes so deactivated users aren't flashed
  // a forbidden page before the guarding effect redirects them.
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const requiresAuthSession =
    protectedRoutes.some((route) => matchesRoute(pathWithoutLocale, route)) ||
    pendingDeletionRoutes.some((route) => matchesRoute(pathWithoutLocale, route));

  if (requiresAuthSession && (!isSessionInitialized || !isAuthenticated)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
