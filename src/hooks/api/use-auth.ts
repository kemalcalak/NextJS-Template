import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { authService } from "@/lib/api/endpoints/auth";
import { getLocaleFromPath, ROUTES, getLocalizedPath } from "@/lib/config/routes";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "@/lib/types/auth";
import { SystemRole } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";

import type { AxiosError } from "axios";

/**
 * Auth Hooks
 * Contains mutation operations like Login and Register.
 */

export function useLoginMutation() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      login(data.user);
      const target = data.user.deletion_scheduled_at ? ROUTES.accountDeactivated : ROUTES.dashboard;
      router.push(getLocalizedPath(target, currentLocale));
    },
    onError: (
      error: AxiosError<{ error?: string; detail?: string; success?: boolean }>,
      variables: LoginPayload,
    ) => {
      const errorData = error.response?.data;
      const errorCode = errorData?.error || errorData?.detail;

      if (error.response?.status === 403 && errorCode === "error.user.email_not_verified") {
        const path = `${ROUTES.verifyEmailNotice}?email=${encodeURIComponent(variables.email)}`;
        router.push(getLocalizedPath(path, currentLocale));
      }
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { i18n } = useTranslation();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      authService.register({ lang: i18n.language, ...payload }),
    onSuccess: (_, variables) => {
      const path = `${ROUTES.verifyEmailNotice}?email=${encodeURIComponent(variables.email)}`;
      router.push(getLocalizedPath(path, currentLocale));
    },
    onError: () => {
      // Handled globally by api interceptor
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const queryClient = useQueryClient();
  const { logout, user } = useAuthStore();

  // Pick the login surface that matches who the user *was* — clearing the
  // store first would erase the role. Admins stay in the admin login flow
  // (future-proof for the admin.<domain> split), everyone else lands on /login.
  const redirectAfterLogout = () => {
    const target = user?.role === SystemRole.ADMIN ? ROUTES.adminLogin : ROUTES.login;
    logout();
    queryClient.clear();
    router.push(getLocalizedPath(target, currentLocale));
  };

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: redirectAfterLogout,
    onError: redirectAfterLogout,
  });
}

export function useVerifyEmailMutation() {
  const { i18n } = useTranslation();
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) =>
      authService.verifyEmail({ lang: i18n.language, ...payload }),
  });
}

export function useForgotPasswordMutation() {
  const { i18n } = useTranslation();
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword({ lang: i18n.language, ...payload }),
  });
}

export function useResetPasswordMutation() {
  const { i18n } = useTranslation();
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authService.resetPassword({ lang: i18n.language, ...payload }),
  });
}

export function useResendVerificationMutation() {
  const { i18n } = useTranslation();
  return useMutation({
    mutationFn: (payload: { email: string; lang?: string }) =>
      authService.resendVerification({ lang: i18n.language, ...payload }),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
  });
}
