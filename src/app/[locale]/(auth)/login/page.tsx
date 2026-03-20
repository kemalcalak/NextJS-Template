import { buildMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/types";

import { LoginContent } from "./LoginContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as SeoLocale,
    pageKey: "login",
    pathname: "/auth/login",
  });
}

export default function Login() {
  return <LoginContent />;
}
