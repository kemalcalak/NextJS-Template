import { Suspense } from "react";

import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { VerifyEmailContent } from "./VerifyEmailContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "verifyEmail",
    pathname: "/auth/verify-email",
  });
}

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
