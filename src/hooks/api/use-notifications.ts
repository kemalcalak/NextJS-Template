import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "@/lib/api/endpoints/notifications";
import type { NotificationListParams } from "@/lib/types/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  listPrefix: ["notifications", "list"] as const,
  list: (params?: NotificationListParams) => ["notifications", "list", params ?? {}] as const,
  unreadCount: ["notifications", "unreadCount"] as const,
};

export const useNotifications = (params?: NotificationListParams) =>
  useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
  });

// The success notification is driven by the backend `message` via the axios
// response interceptor — no manual toast in either mutation.

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
