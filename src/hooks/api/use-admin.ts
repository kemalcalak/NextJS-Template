import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { adminApi } from "@/lib/api/endpoints/admin";
import { authService } from "@/lib/api/endpoints/auth";
import type {
  AdminActivityListParams,
  AdminCreatePayload,
  AdminPermissionsUpdatePayload,
  AdminPromotePayload,
  AdminUserListParams,
  AdminUserUpdatePayload,
  RootTransferConfirmPayload,
  RootTransferRequestPayload,
} from "@/lib/types/admin";
import { useAuthStore } from "@/stores/auth.store";

// Each resource type owns a distinct top-level segment so prefix-invalidation
// never accidentally fans out across resources. `usersList` ≠ `user` ≠
// `userActivities` — invalidating one leaves the others untouched.
export const adminKeys = {
  all: ["admin"] as const,
  usersListPrefix: ["admin", "usersList"] as const,
  usersList: (params?: AdminUserListParams) => ["admin", "usersList", params ?? {}] as const,
  user: (id: string) => ["admin", "user", id] as const,
  userActivities: (userId: string, opts?: { skip?: number; limit?: number }) =>
    ["admin", "userActivities", userId, opts ?? {}] as const,
  activitiesListPrefix: ["admin", "activitiesList"] as const,
  activitiesList: (params?: AdminActivityListParams) =>
    ["admin", "activitiesList", params ?? {}] as const,
  stats: ["admin", "stats"] as const,
  admins: ["admin", "admins"] as const,
  permissionCatalog: ["admin", "permissionCatalog"] as const,
};

type QueryClient = ReturnType<typeof useQueryClient>;

// After a user mutation, fan-out invalidation to every surface that could show
// stale data. Crucially, the user detail cache is NOT invalidated — callers
// that optimistically set it (e.g. useUpdateAdminUser) would see their write
// overwritten by a refetch race.
const invalidateUserSurfaces = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: adminKeys.usersListPrefix });
  queryClient.invalidateQueries({ queryKey: adminKeys.stats });
};

export const useAdminUsers = (params?: AdminUserListParams) =>
  useQuery({
    queryKey: adminKeys.usersList(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
  });

export const useAdminUser = (id: string | undefined) =>
  useQuery({
    queryKey: id ? adminKeys.user(id) : ["admin", "user", "invalid"],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return adminApi.getUser(id);
    },
    enabled: Boolean(id),
  });

export const useAdminStats = (enabled = true) =>
  useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => adminApi.getStats(),
    enabled,
  });

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUserUpdatePayload }) =>
      adminApi.updateUser(id, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(adminKeys.user(response.user.id), response.user);
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useSuspendAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useUnsuspendAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unsuspendUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: adminKeys.user(id) });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useChangeAdminUserPassword = () =>
  useMutation({
    mutationFn: ({ id, lang }: { id: string; lang: string }) => adminApi.changePassword(id, lang),
  });

export const useAdminActivities = (params?: AdminActivityListParams) =>
  useQuery({
    queryKey: adminKeys.activitiesList(params),
    queryFn: () => adminApi.listActivities(params),
    placeholderData: keepPreviousData,
  });

export const useAdminUserActivities = (
  userId: string | undefined,
  options?: { skip?: number; limit?: number },
) =>
  useQuery({
    queryKey: userId
      ? adminKeys.userActivities(userId, options)
      : ["admin", "userActivities", "invalid"],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return adminApi.listUserActivities(userId, options);
    },
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });

// --- Admin / RBAC management (superadmin only) -----------------------------

export const useAdmins = (enabled = true) =>
  useQuery({
    queryKey: adminKeys.admins,
    queryFn: () => adminApi.listAdmins(),
    enabled,
  });

export const usePermissionCatalog = (enabled = true) =>
  useQuery({
    queryKey: adminKeys.permissionCatalog,
    queryFn: () => adminApi.getPermissionCatalog(),
    enabled,
    staleTime: Infinity,
  });

export const usePromoteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminPromotePayload) => adminApi.promoteAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useSetAdminPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminPermissionsUpdatePayload }) =>
      adminApi.setAdminPermissions(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
    },
  });
};

export const useDemoteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.demoteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreatePayload) => adminApi.createAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const usePromoteSuperadmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.promoteSuperadmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      invalidateUserSurfaces(queryClient);
    },
  });
};

export const useDemoteSuperadmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.demoteSuperadmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      invalidateUserSurfaces(queryClient);
    },
  });
};

// Step 1 of the root transfer: emails an OTP to the current root. No cache
// changes yet — the handover only happens on confirm.
export const useTransferRoot = () =>
  useMutation({
    mutationFn: (payload: RootTransferRequestPayload) => adminApi.transferRoot(payload),
  });

export const useConfirmTransferRoot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RootTransferConfirmPayload) => adminApi.confirmTransferRoot(payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins });
      // The confirming root just lost root status; refresh /me so the store and
      // every gate update immediately. The WS event does this too — this keeps
      // it deterministic even when the socket is unavailable.
      try {
        const me = await authService.getMe();
        useAuthStore.getState().setUser(me);
      } catch {
        // A failed refresh is reconciled by the auth layer / WS event.
      }
    },
  });
};
