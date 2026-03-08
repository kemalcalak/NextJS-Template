import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User as UserType } from "@/lib/types/user";

export type User = UserType | null;

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // actions
  setUser: (user: User) => void;
  login: (user: NonNullable<User>) => void;
  logout: () => void;
  setHydrated: (val: boolean) => void;
}

interface StoredAuth {
  state?: {
    user?: User;
    isAuthenticated?: boolean;
  };
}

// Helper to get initial state from localStorage for synchronous access
const getStoredAuth = () => {
  try {
    if (typeof window === "undefined") return { user: null, isAuthenticated: false };
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return { user: null, isAuthenticated: false };
    const parsed = JSON.parse(raw) as unknown as StoredAuth;
    return {
      user: parsed.state?.user || null,
      isAuthenticated: parsed.state?.isAuthenticated || false,
    };
  } catch {
    return { user: null, isAuthenticated: false };
  }
};

const initialData =
  typeof window !== "undefined" ? getStoredAuth() : { user: null, isAuthenticated: false };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialData,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setHydrated: (val) => set({ isHydrated: val }),

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
