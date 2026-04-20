import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { adminApi } from "@/lib/api/endpoints/admin";
import type {
  AdminActivityListParams,
  AdminUserListParams,
  AdminUserUpdatePayload,
} from "@/lib/types/admin";

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
    enabled: typeof id === "string",
  });

export const useAdminStats = () =>
  useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => adminApi.getStats(),
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

export const useResetAdminUserPassword = () =>
  useMutation({
    mutationFn: ({ id, lang }: { id: string; lang: string }) => adminApi.resetPassword(id, lang),
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
    enabled: typeof userId === "string",
    placeholderData: keepPreviousData,
  });
