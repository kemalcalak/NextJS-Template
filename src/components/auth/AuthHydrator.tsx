"use client";

import { useEffect } from "react";

import { usersApi } from "@/lib/api/endpoints/users";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { setUser, setSessionInitialized, isSessionInitialized } = useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const user = await usersApi.getMe();
        setUser(user);
      } catch {
        // Not logged in or error
        setUser(null);
      } finally {
        setSessionInitialized(true);
      }
    };

    if (!isSessionInitialized) {
      void hydrate();
    }
  }, [setUser, setSessionInitialized, isSessionInitialized]);

  return <>{children}</>;
}
