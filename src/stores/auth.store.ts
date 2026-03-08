import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setCookie, eraseCookie } from "@/lib/cookies";
import type { User as UserType } from "@/lib/types/user";

export type User = UserType | null;

interface AuthState {
  user: User;
  token: string | null;
  isLoading: boolean;

  // actions
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  login: (payload: { token: string; user?: NonNullable<User> }) => void;
  logout: () => void;
}

interface StoredAuth {
  state?: {
    user?: User;
    token?: string | null;
  };
}

// Helper to get initial state from localStorage for synchronous access
const getStoredAuth = () => {
  try {
    if (typeof window === "undefined") return { user: null, token: null };
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as unknown as StoredAuth;
    return {
      user: parsed.state?.user || null,
      token: parsed.state?.token || null,
    };
  } catch {
    return { user: null, token: null };
  }
};

const initialData = typeof window !== "undefined" ? getStoredAuth() : { user: null, token: null };

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialData,
      isLoading: false, // Start as false since we read sync from localStorage

      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          setCookie("access_token", token, 30);
        } else {
          eraseCookie("access_token");
        }
        set({ token });
      },

      login: ({ token, user }) => {
        setCookie("access_token", token, 30); // 30 days
        set({
          token,
          user: user ?? get().user,
          isLoading: false,
        });
      },

      logout: () => {
        eraseCookie("access_token");
        set({ user: null, token: null, isLoading: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
