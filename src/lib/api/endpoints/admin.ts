import type {
  AdminActivityListParams,
  AdminActivityListResponse,
  AdminStats,
  AdminUser,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserUpdatePayload,
  AdminUserUpdateResponse,
} from "@/lib/types/admin";
import type { MessageResponse } from "@/lib/types/auth";

import api from "../api";

// Drop undefined / empty-string keys so axios doesn't serialize them onto the
// URL. Generic over the caller's param type so we don't have to widen admin
// request shapes to `Record<string, unknown>` just to satisfy the helper.
const pruneParams = <T extends object>(params?: T): Partial<T> | undefined => {
  if (!params) return undefined;
  const result: Partial<T> = {};
  let hasEntry = false;
  for (const key of Object.keys(params) as (keyof T)[]) {
    const value = params[key];
    if (value === undefined || value === "") continue;
    result[key] = value;
    hasEntry = true;
  }
  return hasEntry ? result : undefined;
};

export const adminApi = {
  listUsers: (params?: AdminUserListParams): Promise<AdminUserListResponse> =>
    api.get<AdminUserListResponse, AdminUserListResponse>("/admin/users", {
      params: pruneParams(params),
    }),

  getUser: (id: string): Promise<AdminUser> => api.get<AdminUser, AdminUser>(`/admin/users/${id}`),

  updateUser: (id: string, payload: AdminUserUpdatePayload): Promise<AdminUserUpdateResponse> =>
    api.patch<AdminUserUpdateResponse, AdminUserUpdateResponse>(`/admin/users/${id}`, payload),

  activateUser: (id: string): Promise<MessageResponse> =>
    api.post<MessageResponse, MessageResponse>(`/admin/users/${id}/activate`),

  deactivateUser: (id: string): Promise<MessageResponse> =>
    api.post<MessageResponse, MessageResponse>(`/admin/users/${id}/deactivate`),

  deleteUser: (id: string): Promise<MessageResponse> =>
    api.delete<MessageResponse, MessageResponse>(`/admin/users/${id}`),

  resetPassword: (id: string, lang: string): Promise<MessageResponse> =>
    api.post<MessageResponse, MessageResponse>(`/admin/users/${id}/reset-password`, undefined, {
      params: { lang },
    }),

  listUserActivities: (
    userId: string,
    params?: Pick<AdminActivityListParams, "skip" | "limit">,
  ): Promise<AdminActivityListResponse> =>
    api.get<AdminActivityListResponse, AdminActivityListResponse>(
      `/admin/users/${userId}/activities`,
      { params: pruneParams(params) },
    ),

  listActivities: (params?: AdminActivityListParams): Promise<AdminActivityListResponse> =>
    api.get<AdminActivityListResponse, AdminActivityListResponse>("/admin/activities", {
      params: pruneParams(params),
    }),

  getStats: (): Promise<AdminStats> => api.get<AdminStats, AdminStats>("/admin/stats"),
};
