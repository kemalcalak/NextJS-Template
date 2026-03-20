import { Suspense } from "react";

import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { ResetPasswordContent } from "./ResetPasswordContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "resetPassword",
    pathname: "/auth/reset-password",
  });
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
