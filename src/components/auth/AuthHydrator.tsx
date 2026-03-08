"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { usersApi } from "@/lib/api/endpoints/users";
import { matchesRoute, protectedRoutes } from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { setUser, setSessionInitialized, isSessionInitialized, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const user = await usersApi.getMe();
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
      const pathWithoutLocale = pathname.replace(/^\/(en|tr)/, "") || "/";
      const isProtectedRoute = protectedRoutes.some((route) =>
        matchesRoute(pathWithoutLocale, route),
      );

      if (isProtectedRoute) {
        const currentLocale = pathname.split("/")[1] || "en";
        router.replace(`/${currentLocale}/login`);
      }
    }
  }, [isSessionInitialized, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
