import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { AdminLoginContent } from "./AdminLoginContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "adminLogin",
    pathname: "/admin/login",
  });
}

export default function AdminLoginPage() {
  return <AdminLoginContent />;
}
