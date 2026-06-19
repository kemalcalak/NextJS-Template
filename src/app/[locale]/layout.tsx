import { Albert_Sans, Fraunces, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import { AppHeader } from "@/components/layout/AppHeader";
import { buildMetadata, validateLocale } from "@/lib/seo/metadata";
import { buildThemeStyleSheet } from "@/lib/theme/colors";
import { ClientSideProviders } from "@/providers/ClientSideProviders";

import type { Metadata } from "next";

import "../globals.css";

// Pre-rendered so both light and dark CSS variables are present in the initial
// HTML; next-themes' inline script flips the .dark class before hydration,
// avoiding a flash of unthemed content.
const THEME_STYLES = buildThemeStyleSheet();

// Body face: warm, readable grotesque. Display face: characterful serif used
// for h1–h3 via the base layer in globals.css. latin-ext covers Turkish glyphs.
const albertSans = Albert_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT", "WONK"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generate locale-aware metadata for the root layout of each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "home",
    pathname: "",
  });
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";

  // Nonce minted per-request in src/proxy.ts; next-themes stamps it on its
  // pre-hydration inline script so the nonce-based CSP allows it to run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger -- internal theme CSS, no user input */}
        <style dangerouslySetInnerHTML={{ __html: THEME_STYLES }} />
      </head>
      <body
        className={`${albertSans.variable} ${fraunces.variable} ${geistMono.variable} antialiased`}
      >
        <ClientSideProviders locale={locale} nonce={nonce}>
          <div className="relative flex min-h-screen flex-col bg-background">
            <AnnouncementBanner />
            <AppHeader />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </ClientSideProviders>
      </body>
    </html>
  );
}
