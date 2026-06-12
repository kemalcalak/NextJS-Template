import { useMemo } from "react";

import { Permission } from "@/lib/types/permissions";
import { SystemRole } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";

export interface PermissionsApi {
  /** True when the current user is a superadmin (implicitly holds everything). */
  isSuperadmin: boolean;
  /** The granted permission keys (empty for regular users and superadmins). */
  permissions: Permission[];
  /** Whether the current user may exercise a given permission. */
  has: (permission: Permission) => boolean;
}

/**
 * Read the current user's RBAC capabilities from the auth store.
 *
 * Superadmins short-circuit to `true` for every check via their role, so the
 * backend never has to ship them a permission list. Plain admins are gated by
 * the grants delivered on `/users/me`.
 */
export function usePermissions(): PermissionsApi {
  const user = useAuthStore((state) => state.user);

  return useMemo<PermissionsApi>(() => {
    const isSuperadmin = user?.role === SystemRole.SUPERADMIN;
    const permissions = user?.permissions ?? [];
    const granted = new Set(permissions);
    return {
      isSuperadmin,
      permissions,
      has: (permission: Permission) => isSuperadmin || granted.has(permission),
    };
  }, [user]);
}

export const useIsSuperadmin = (): boolean => usePermissions().isSuperadmin;

/** True only for the root superadmin (governs the superadmin-tier actions). */
export const useIsRootSuperadmin = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.is_root_superadmin === true;
};

export const useCanReadUsers = (): boolean => usePermissions().has(Permission.UsersRead);
export const useCanWriteUsers = (): boolean => usePermissions().has(Permission.UsersWrite);
export const useCanDeleteUsers = (): boolean => usePermissions().has(Permission.UsersDelete);
export const useCanSuspendUsers = (): boolean => usePermissions().has(Permission.UsersSuspend);
export const useCanResetUserPassword = (): boolean =>
  usePermissions().has(Permission.UsersPasswordReset);
export const useCanManageUserSessions = (): boolean =>
  usePermissions().has(Permission.UsersSessions);

export const useCanReadFiles = (): boolean => usePermissions().has(Permission.FilesRead);
export const useCanDeleteFiles = (): boolean => usePermissions().has(Permission.FilesDelete);

export const useCanReadSupport = (): boolean => usePermissions().has(Permission.SupportRead);
export const useCanWriteSupport = (): boolean => usePermissions().has(Permission.SupportWrite);
export const useCanUpdateSupport = (): boolean => usePermissions().has(Permission.SupportUpdate);

export const useCanReadActivities = (): boolean => usePermissions().has(Permission.ActivitiesRead);
export const useCanReadStats = (): boolean => usePermissions().has(Permission.StatsRead);
