import { buildMetadata, validateLocale } from "@/lib/seo/metadata";

import { UsersContent } from "./UsersContent";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: validateLocale(locale),
    pageKey: "adminUsers",
    pathname: "/admin/users",
  });
}

export default function AdminUsersPage() {
  return <UsersContent />;
}
