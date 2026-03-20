import { buildMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/types";

import { RegisterContent } from "./RegisterContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as SeoLocale,
    pageKey: "register",
    pathname: "/auth/register",
  });
}

export default function Register() {
  return <RegisterContent />;
}
