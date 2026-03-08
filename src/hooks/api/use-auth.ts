import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { authService } from "@/lib/api/endpoints/auth";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "@/lib/types/auth";
import { useAuthStore } from "@/stores/auth.store";

import type { AxiosError } from "axios";

/**
 * Auth Hooks
 * Contains mutation operations like Login and Register.
 */

export function useLoginMutation() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      login(data.user);
      router.push("/dashboard");
    },
    onError: (
      error: AxiosError<{ error?: string; detail?: string; success?: boolean }>,
      variables: LoginPayload,
    ) => {
      const errorData = error.response?.data;
      const errorCode = errorData?.error || errorData?.detail;

      if (error.response?.status === 403 && errorCode === "error.user.email_not_verified") {
        router.push(`/verify-email-notice?email=${encodeURIComponent(variables.email)}`);
      }
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const { i18n } = useTranslation();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      authService.register({ lang: i18n.language, ...payload }),
    onSuccess: (_, variables) => {
      router.push(`/verify-email-notice?email=${encodeURIComponent(variables.email)}`);
    },
    onError: () => {
      // Handled globally by api interceptor
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      router.push("/login");
    },
    onError: () => {
      logout();
      router.push("/login");
    },
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
    onSuccess: () => {
      /* no-op */
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
  });
}
