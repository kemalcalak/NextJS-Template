"use client";

import { useEffect, useState } from "react";

import { AuthHydrator } from "@/components/auth/AuthHydrator";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import i18n from "@/i18n/config";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

const loadingMessages: Record<string, string> = {
  en: "Loading...",
  tr: "Yükleniyor...",
};

export function ClientSideProviders({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const syncLocale = async () => {
      if (i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }
      if (!cancelled) setMounted(true);
    };
    void syncLocale();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const loadingMessage = loadingMessages[locale] || loadingMessages.en;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!mounted ? (
        <LoadingScreen fullScreen message={loadingMessage} />
      ) : (
        <QueryProvider>
          <AuthHydrator>
            <ErrorBoundary>{children}</ErrorBoundary>
          </AuthHydrator>
        </QueryProvider>
      )}
    </ThemeProvider>
  );
}
