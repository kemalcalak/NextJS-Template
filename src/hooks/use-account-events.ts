"use client";

import { useEffect } from "react";

import { authService } from "@/lib/api/endpoints/auth";
import { createAccountSocket } from "@/lib/websocket/account-socket";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Hold a per-user account notification socket while mounted.
 *
 * When a superadmin changes the current admin's grants, the backend pushes a
 * `permissions_updated` event; we refetch `/users/me` so the new permission set
 * takes effect immediately (nav + gates) without a re-login.
 */
export const useAccountEvents = (): void => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = createAccountSocket((event) => {
      if (event.type !== "permissions_updated") return;
      void (async () => {
        try {
          const me = await authService.getMe();
          setUser(me);
        } catch {
          // A failed refetch (e.g. the session was lost) is handled by the
          // auth layer; nothing to do here.
        }
      })();
    });

    return () => {
      socket.close();
    };
  }, [isAuthenticated, setUser]);
};
