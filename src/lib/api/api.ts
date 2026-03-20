import axios from "axios";
import { toast } from "sonner";

import i18n from "@/i18n/config";
import {
  ROUTES,
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  protectedRoutes,
  matchesRoute,
} from "@/lib/config/routes";
import { useAuthStore } from "@/stores/auth.store";

import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

interface ErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}

const isServer = typeof window === "undefined";
const API_URL = isServer ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") : "";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const translateAndToast = (key: string, type: "success" | "error", id?: string) => {
  const namespace = type === "success" ? "success" : "errors";
  const translatedMessage = i18n.t(`${namespace}:${key}`, {
    defaultValue: i18n.t(`common:${key}`, { defaultValue: key }),
  });
  if (type === "success") {
    toast.success(translatedMessage, { id: id || key });
  } else {
    toast.error(translatedMessage, { id: id || key });
  }
};

const performLogout = async () => {
  const { isAuthenticated, logout } = useAuthStore.getState();

  // Always clear client state first
  logout();

  if (isAuthenticated) {
    try {
      await axios.post(`${API_URL}${API_PREFIX}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Ignore background logout failure
    }
  }

  // Restore hard redirect to clear React Query cache and other stale state
  if (typeof window !== "undefined") {
    const locale = getLocaleFromPath(window.location.pathname);
    const pathWithoutLocale = getPathWithoutLocale(window.location.pathname);

    // Only redirect to login if we are currently on a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
      matchesRoute(pathWithoutLocale, route),
    );

    if (isProtectedRoute) {
      const loginPath = getLocalizedPath(ROUTES.login, locale);
      window.location.href = `${loginPath}?session_expired=true`;
    }
  }
};

const handleNonAuthError = (error: AxiosError<ErrorResponse>) => {
  const rawError =
    error.response?.data?.error || error.response?.data?.detail || error.response?.data?.message;

  // Skip errors that are handled by redirections in hooks
  const skipToastErrors = ["error.user.email_not_verified"];

  if (rawError && !skipToastErrors.includes(rawError)) {
    translateAndToast(rawError, "error");
  } else if (!error.response) {
    translateAndToast("INTERNAL_SERVER_ERROR", "error", "INTERNAL_SERVER_ERROR");
  }
};

let refreshPromise: Promise<string> | null = null;

const attemptTokenRefresh = async (
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
) => {
  try {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          await axios.post(`${API_URL}${API_PREFIX}/auth/refresh`, {}, { withCredentials: true });
          return "refreshed";
        } finally {
          refreshPromise = null;
        }
      })();
    }

    await refreshPromise;
    return await api(originalRequest);
  } catch (refreshError) {
    void performLogout();
    return Promise.reject(
      refreshError instanceof Error ? refreshError : new Error(String(refreshError)),
    );
  }
};

const handleUnauthorized = (error: AxiosError<ErrorResponse>, isAuthRequest: boolean) => {
  const rawError =
    error.response?.data?.error || error.response?.data?.detail || error.response?.data?.message;

  if (rawError) {
    translateAndToast(rawError, "error", rawError);
  } else {
    translateAndToast("genericError", "error", "genericError");
  }

  if (!isAuthRequest) {
    void performLogout();
  }
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as { message?: string };
    const rawMessage = data?.message;
    if (rawMessage && response.config.method?.toLowerCase() !== "get") {
      translateAndToast(rawMessage, "success");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  },
  (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest.url || "";
    const isAuthRequest = url.includes("/auth/") && !url.includes("/auth/change-password");

    if (status !== 401) {
      handleNonAuthError(error);
      return Promise.reject(error);
    }

    if (!originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      return attemptTokenRefresh(originalRequest);
    }

    handleUnauthorized(error, isAuthRequest);
    return Promise.reject(error);
  },
);

export default api;
