"use client";

import { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useLogoutMutation } from "@/hooks/api/use-auth";

export default function Logout() {
  const { t } = useTranslation("auth");
  const { mutateAsync: logout } = useLogoutMutation();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch {
        // Redirection is handled by the mutation hook's onError
      }
    };

    performLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center p-4 gap-4">
      <LoadingScreen message={t("logout.signingOut")} fullScreen={false} />
    </div>
  );
}
