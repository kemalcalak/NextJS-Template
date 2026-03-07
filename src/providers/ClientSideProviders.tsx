"use client";

import { useEffect } from "react";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
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
  useEffect(() => {
    if (!i18n.isInitialized || i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </QueryProvider>
    </ThemeProvider>
  );
}
