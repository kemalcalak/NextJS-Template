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
  // Gate the first paint behind i18n being in sync with the URL locale so we
  // don't flash English copy on a /tr/ route. Once we've crossed that bar the
  // gate stays open — later language switches just re-render via react-i18next
  // without a full-screen loader.
  const [initialSync, setInitialSync] = useState(() => i18n.language === locale);

  useEffect(() => {
    if (initialSync) return;
    let cancelled = false;
    void i18n.changeLanguage(locale).finally(() => {
      if (!cancelled) setInitialSync(true);
    });
    return () => {
      cancelled = true;
    };
  }, [initialSync, locale]);

  useEffect(() => {
    if (!initialSync) return;
    if (i18n.language === locale) return;
    void i18n.changeLanguage(locale);
  }, [initialSync, locale]);

  const loadingMessage = loadingMessages[locale] || loadingMessages.en;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!initialSync ? (
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
