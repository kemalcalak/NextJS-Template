"use client";

import { useEffect, useState } from "react";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import i18n from "@/i18n/config";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

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
      if (!i18n.isInitialized || i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }
      setMounted(true);
    };
    void initI18n();
  }, [locale]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!mounted ? (
        <LoadingScreen fullScreen />
      ) : (
        <QueryProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryProvider>
      )}
    </ThemeProvider>
  );
}
