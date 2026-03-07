"use client";

import "@/i18n/config";

import { QueryProvider } from "./QueryProvider";

export function ClientSideProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
