import { Suspense } from "react";

import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { VerifyEmailNoticeContent } from "./VerifyEmailNoticeContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "verifyEmailNotice",
    pathname: "/auth/verify-email-notice",
  });
}

export default function VerifyEmailNotice() {
  return (
    <Suspense>
      <VerifyEmailNoticeContent />
    </Suspense>
  );
}
