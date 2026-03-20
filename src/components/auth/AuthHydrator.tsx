"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { authService } from "@/lib/api/endpoints/auth";
import {
  getLocaleFromPath,
  getPathWithoutLocale,
  matchesRoute,
  protectedRoutes,
  ROUTES,
  getLocalizedPath,
} from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { setUser, setSessionInitialized, isSessionInitialized, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
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
    if (isSessionInitialized && !isAuthenticated) {
      const pathWithoutLocale = getPathWithoutLocale(pathname);
      const isProtectedRoute = protectedRoutes.some((route) =>
        matchesRoute(pathWithoutLocale, route),
      );

      if (isProtectedRoute) {
        const currentLocale = getLocaleFromPath(pathname);
        router.replace(`${getLocalizedPath(ROUTES.login, currentLocale)}?session_expired=true`);
      }
    }
  }, [isSessionInitialized, isAuthenticated, pathname, router]);

  // While hydrating, don't show children for protected routes
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const isProtectedRoute = protectedRoutes.some((route) => matchesRoute(pathWithoutLocale, route));

  if (isProtectedRoute && (!isSessionInitialized || !isAuthenticated)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
