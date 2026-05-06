import { env } from "@/env";

import type { Metadata, Viewport } from "next";

// Global viewport settings applied to all pages
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Fallback metadata — locale-specific layouts will override these
export const metadata: Metadata = {
  title: {
    default: "NextJS Template",
    template: "%s — NextJS Template",
  },
  description: "Next.js + i18n Boilerplate",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
