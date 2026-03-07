import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/common/AppHeader";
import { NotFound } from "@/components/common/NotFound";
import { ClientSideProviders } from "@/providers/ClientSideProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSideProviders locale="en">
          <div className="relative flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1 flex flex-col">
              <NotFound />
            </main>
          </div>
        </ClientSideProviders>
      </body>
    </html>
  );
}
