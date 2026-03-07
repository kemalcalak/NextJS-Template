"use client";

import "@/i18n/config";
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
  if (i18n.language !== locale && i18n.isInitialized) {
    i18n.changeLanguage(locale);
  } else if (!i18n.isInitialized) {
    i18n.language = locale;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
