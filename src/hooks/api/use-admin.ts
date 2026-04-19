import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { adminApi } from "@/lib/api/endpoints/admin";
import type {
  AdminActivityListParams,
  AdminUserListParams,
  AdminUserUpdatePayload,
} from "@/lib/types/admin";

export const adminKeys = {
  root: ["admin"] as const,
  users: (params?: AdminUserListParams) => ["admin", "users", params ?? {}] as const,
  user: (id: string) => ["admin", "users", "detail", id] as const,
  activities: (params?: AdminActivityListParams) => ["admin", "activities", params ?? {}] as const,
  userActivities: (userId: string, skip?: number, limit?: number) =>
    ["admin", "users", userId, "activities", { skip, limit }] as const,
};

const invalidateAdminUsers = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
};

export const useAdminUsers = (params?: AdminUserListParams) =>
  useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
  });

export const useAdminUser = (id: string | undefined) =>
  useQuery({
    queryKey: id ? adminKeys.user(id) : ["admin", "users", "detail", "invalid"],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return adminApi.getUser(id);
    },
    enabled: typeof id === "string",
  });

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUserUpdatePayload }) =>
      adminApi.updateUser(id, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(adminKeys.user(response.user.id), response.user);
      invalidateAdminUsers(queryClient);
    },
  });
};

export const useActivateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      invalidateAdminUsers(queryClient);
    },
  });
};

export const useDeactivateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      invalidateAdminUsers(queryClient);
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      invalidateAdminUsers(queryClient);
    },
  });
};

export const useResetAdminUserPassword = () =>
  useMutation({
    mutationFn: ({ id, lang }: { id: string; lang: string }) => adminApi.resetPassword(id, lang),
  });

export const useAdminActivities = (params?: AdminActivityListParams) =>
  useQuery({
    queryKey: adminKeys.activities(params),
    queryFn: () => adminApi.listActivities(params),
    placeholderData: keepPreviousData,
  });

export const useAdminUserActivities = (
  userId: string | undefined,
  options?: { skip?: number; limit?: number },
) =>
  useQuery({
    queryKey: userId
      ? adminKeys.userActivities(userId, options?.skip, options?.limit)
      : ["admin", "users", "invalid", "activities"],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return adminApi.listUserActivities(userId, options);
    },
    enabled: typeof userId === "string",
    placeholderData: keepPreviousData,
  });
