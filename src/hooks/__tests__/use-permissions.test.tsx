import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  useCanDeleteUsers,
  useCanReadUsers,
  useIsSuperadmin,
  usePermissions,
} from "@/hooks/use-permissions";
import { Permission } from "@/lib/types/permissions";
import { SystemRole, type User } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";

function makeUser(role: SystemRole, permissions?: Permission[]): User {
  return {
    id: "u-1",
    email: "u@test.com",
    first_name: null,
    last_name: null,
    title: null,
    role,
    is_active: true,
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deactivated_at: null,
    deletion_scheduled_at: null,
    suspended_at: null,
    permissions,
  };
}

afterEach(() => {
  useAuthStore.setState({ user: null });
});

describe("usePermissions", () => {
  it("denies everything for a regular user", () => {
    useAuthStore.setState({ user: makeUser(SystemRole.USER) });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperadmin).toBe(false);
    expect(result.current.has(Permission.UsersRead)).toBe(false);
  });

  it("grants only the listed permissions for an admin", () => {
    useAuthStore.setState({ user: makeUser(SystemRole.ADMIN, [Permission.UsersRead]) });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.has(Permission.UsersRead)).toBe(true);
    expect(result.current.has(Permission.UsersDelete)).toBe(false);
    expect(result.current.permissions).toEqual([Permission.UsersRead]);
  });

  it("grants every permission for a superadmin", () => {
    useAuthStore.setState({ user: makeUser(SystemRole.SUPERADMIN) });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperadmin).toBe(true);
    expect(result.current.has(Permission.UsersDelete)).toBe(true);
    expect(result.current.has(Permission.StatsRead)).toBe(true);
  });

  it("returns false when there is no user", () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.has(Permission.UsersRead)).toBe(false);
  });
});

describe("per-permission hooks", () => {
  it("reflect the admin's grant set", () => {
    useAuthStore.setState({ user: makeUser(SystemRole.ADMIN, [Permission.UsersRead]) });
    expect(renderHook(() => useCanReadUsers()).result.current).toBe(true);
    expect(renderHook(() => useCanDeleteUsers()).result.current).toBe(false);
    expect(renderHook(() => useIsSuperadmin()).result.current).toBe(false);
  });

  it("are all true for a superadmin", () => {
    useAuthStore.setState({ user: makeUser(SystemRole.SUPERADMIN) });
    expect(renderHook(() => useCanDeleteUsers()).result.current).toBe(true);
    expect(renderHook(() => useIsSuperadmin()).result.current).toBe(true);
  });
});
