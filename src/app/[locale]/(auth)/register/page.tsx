import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { RegisterContent } from "./RegisterContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "register",
    pathname: "/auth/register",
  });
}

export default function Register() {
  return <RegisterContent />;
}
