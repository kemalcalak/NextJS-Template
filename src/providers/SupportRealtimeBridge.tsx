"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { SystemRole } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";
import { useSupportRealtimeStore } from "@/stores/support-realtime.store";

// Bridges the session lifecycle into the support realtime store: opens the one
// socket after login and closes it on logout/unmount. Renders nothing — it's a
// thin effect component so the store itself stays a pure service with no React
// or hook dependencies. Mounted once inside AuthHydrator.
export function SupportRealtimeBridge() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.user?.role === SystemRole.ADMIN);
  const connect = useSupportRealtimeStore((state) => state.connect);
  const disconnect = useSupportRealtimeStore((state) => state.disconnect);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    connect({ queryClient, isAdmin });
    return () => {
      disconnect();
    };
  }, [isAuthenticated, userId, isAdmin, queryClient, connect, disconnect]);

  return null;
}
