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
  // Initial state MUST match on server and client to avoid a hydration
  // mismatch. `i18n.language` diverges across the two (server uses the static
  // fallback, client's LanguageDetector may read a cookie), so we always start
  // `false` and let the effect below flip it once i18n is in sync with the URL
  // locale. This costs one frame of LoadingScreen flash; any alternative
  // reading i18n.language during render would flicker hydration warnings.
  const [initialSync, setInitialSync] = useState(false);

  useEffect(() => {
    if (i18n.language === locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialSync(true);
      return;
    }
    let cancelled = false;
    void i18n.changeLanguage(locale).finally(() => {
      if (!cancelled) setInitialSync(true);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

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
