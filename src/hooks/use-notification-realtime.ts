"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "@/hooks/api/use-notifications";
import { createNotificationSocket } from "@/lib/websocket/notification-socket";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Hold a per-user notification socket while mounted.
 *
 * When the backend pushes a `notification_created` event, every notification
 * surface (bell badge, inbox list) is invalidated so it refetches and shows
 * the new entry immediately. The socket lives and dies with authentication.
 */
export const useNotificationRealtime = (): void => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = createNotificationSocket(() => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    return () => {
      socket.close();
    };
  }, [isAuthenticated, queryClient]);
};
