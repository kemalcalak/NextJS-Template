"use client";

import { useEffect } from "react";
import { usersApi } from "@/lib/api/endpoints/users";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
    const { setUser, setHydrated, isHydrated } = useAuthStore();

    useEffect(() => {
        const hydrate = async () => {
            try {
                const user = await usersApi.getMe();
                setUser(user);
            } catch (error) {
                // Not logged in or error
                setUser(null);
            } finally {
                setHydrated(true);
            }
        };

        if (!isHydrated) {
            void hydrate();
        }
    }, [setUser, setHydrated, isHydrated]);

    return <>{children}</>;
}
