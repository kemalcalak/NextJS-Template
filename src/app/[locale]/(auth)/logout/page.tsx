"use client";

import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useLogoutMutation } from "@/hooks/api/use-auth";

export default function Logout() {
  const { t } = useTranslation("auth");
  const { mutateAsync: logout } = useLogoutMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const performLogout = async () => {
      try {
        await logout();
      } catch (_err) {
        if (isMounted) setError(t("logout.errorMsg"));
      }
    };

    performLogout();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center p-4 gap-4">
      <LoadingScreen message={t("logout.signingOut")} fullScreen={false} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
