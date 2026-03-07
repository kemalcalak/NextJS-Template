"use client";

import { useEffect, useState, Suspense } from "react";

import { MailCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/endpoints/auth";

import type { AxiosError } from "axios";

function VerifyEmailContent() {
  const { t } = useTranslation("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing">(
    token ? "loading" : "missing",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail({ token });
        setStatus("success");
      } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        setStatus("error");
        setErrorMessage(axiosError.response?.data?.detail || t("verifyEmail.errorMsg"));
      }
    };

    verify();
  }, [token, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <MailCheck className="h-6 w-6" />
          </motion.div>
        </div>
        {status === "loading" && (
          <LoadingScreen message={t("verifyEmail.verifying")} fullScreen={false} />
        )}

        {status === "missing" && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("verifyEmail.invalidLinkTitle")}
            </h1>
            <p className="text-muted-foreground">{t("verifyEmail.invalidLinkDesc")}</p>
            <Button asChild className="mt-4">
              <Link href="/login">{t("verifyEmail.backToLogin")}</Link>
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{t("verifyEmail.successTitle")}</h1>
            <p className="text-muted-foreground">{t("verifyEmail.successDesc")}</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/login">{t("verifyEmail.loginNow")}</Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{t("verifyEmail.failedTitle")}</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/login">{t("verifyEmail.backToLogin")}</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
