import { Geist, Geist_Mono } from "next/font/google";

import { AppHeader } from "@/components/common/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import { ClientSideProviders } from "@/providers/ClientSideProviders";

import type { Metadata } from "next";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextJS Template",
  description: "Next.js + i18n Boilerplate",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSideProviders locale={locale}>
          <div className="relative flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </ClientSideProviders>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
