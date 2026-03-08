"use client";

import { useEffect, useState } from "react";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import i18n from "@/i18n/config";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthHydrator } from "@/components/auth/AuthHydrator";

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
    const initI18n = async () => {
      if (!i18n.isInitialized) {
        await i18n.changeLanguage(locale);
      }
      setMounted(true);
    };
    void initI18n();
  }, [locale]);

  useEffect(() => {
    if (mounted && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, mounted]);

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
