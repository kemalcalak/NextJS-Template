import { buildMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/types";

import { DashboardContent } from "./DashboardContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as SeoLocale,
    pageKey: "dashboard",
    pathname: "/dashboard",
  });
}

export default function Dashboard() {
  return <DashboardContent />;
}
