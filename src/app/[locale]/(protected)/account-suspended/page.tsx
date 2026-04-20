import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { AccountSuspendedContent } from "./AccountSuspendedContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "accountSuspended",
    pathname: "/account-suspended",
  });
}

export default function AccountSuspendedPage() {
  return <AccountSuspendedContent />;
}
