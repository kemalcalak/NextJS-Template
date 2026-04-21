import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { ActivitiesContent } from "./ActivitiesContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "adminActivities",
    pathname: "/admin/activities",
  });
}

export default function AdminActivitiesPage() {
  return <ActivitiesContent />;
}
