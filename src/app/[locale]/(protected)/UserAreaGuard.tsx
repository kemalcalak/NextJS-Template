"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { getLocaleFromPath, getLocalizedPath, ROUTES } from "@/lib/config/routes";
import { SystemRole } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";

// Admins/superadmins belong in the admin panel, not the user-facing app. Once
// the session is hydrated, bounce them out of any user protected route into the
// admin dashboard. Suspended / pending-deletion sessions are left untouched so
// AuthHydrator can route them to their dedicated screens.
export function UserAreaGuard() {
  const isSessionInitialized = useAuthStore((state) => state.isSessionInitialized);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isSessionInitialized || !user) return;
    const isAdminTier = user.role === SystemRole.ADMIN || user.role === SystemRole.SUPERADMIN;
    if (isAdminTier && !user.deletion_scheduled_at && !user.suspended_at) {
      router.replace(getLocalizedPath(ROUTES.adminDashboard, getLocaleFromPath(pathname)));
    }
  }, [isSessionInitialized, user, pathname, router]);

  return null;
}
