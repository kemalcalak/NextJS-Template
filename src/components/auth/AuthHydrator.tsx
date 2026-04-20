"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { authService } from "@/lib/api/endpoints/auth";
import {
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  isAdminPath,
  matchesRoute,
  pendingDeletionRoutes,
  protectedRoutes,
  ROUTES,
  suspendedRoutes,
} from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

// Module-level guard — survives any React remount, including the one the root
// [locale] layout performs when the URL locale segment changes. A component
// ref resets on each mount, but this module is loaded exactly once per page
// load, so /users/me fires at most once per browser session until a hard
// reload. React 19 Strict Mode double-invokes are also naturally absorbed.
let sessionRequestInFlight = false;

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { user, setUser, setSessionInitialized, isSessionInitialized, isAuthenticated } =
    useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (sessionRequestInFlight || isSessionInitialized) return;
    sessionRequestInFlight = true;

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

    void hydrate();
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
    const isSuspendedRoute = suspendedRoutes.some((route) =>
      matchesRoute(pathWithoutLocale, route),
    );

    if (!isAuthenticated) {
      if (isProtectedRoute || isPendingDeletionRoute || isSuspendedRoute) {
        const target = isAdminPath(pathWithoutLocale) ? ROUTES.adminLogin : ROUTES.login;
        router.replace(`${getLocalizedPath(target, currentLocale)}?session_expired=true`);
      }
      return;
    }

    // Admin-suspended sessions route to the suspended landing and nowhere
    // else. Checked before the deletion-grace flow because suspension wins.
    const isSuspended = Boolean(user?.suspended_at);
    if (isSuspended && !isSuspendedRoute) {
      router.replace(getLocalizedPath(ROUTES.accountSuspended, currentLocale));
      return;
    }
    if (!isSuspended && isSuspendedRoute) {
      router.replace(getLocalizedPath(ROUTES.dashboard, currentLocale));
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
  // also covers pendingDeletionRoutes and suspendedRoutes so deactivated /
  // suspended users aren't flashed a forbidden page before the guarding
  // effect redirects them.
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const requiresAuthSession =
    protectedRoutes.some((route) => matchesRoute(pathWithoutLocale, route)) ||
    pendingDeletionRoutes.some((route) => matchesRoute(pathWithoutLocale, route)) ||
    suspendedRoutes.some((route) => matchesRoute(pathWithoutLocale, route));

  if (requiresAuthSession && (!isSessionInitialized || !isAuthenticated)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
